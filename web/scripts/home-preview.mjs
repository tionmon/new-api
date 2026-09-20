/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import fs from 'node:fs'
/**
 * 本地预览真实 web/dist，使用固定配置与假数据；服务仅监听 loopback。
 * PREVIEW_AUTH=1 或 preview_auth=1 cookie 可预览控制台。
 * PREVIEW_SUBSCRIPTION=1 为钱包加入示例订阅。API 写操作仅允许假的会话刷新。
 * 图片和接口均本地化；用户主动点击外链仍会离开预览站点。
 */
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(HERE, '../dist')
const FIXTURES = path.resolve(HERE, 'fixtures')
const PORT = Number(process.env.PORT || 3100)

const STATUS = JSON.parse(
  fs.readFileSync(path.join(FIXTURES, 'status.json'), 'utf8')
)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
}

/** Fake session used only when the `preview_auth=1` cookie is present, so the
 *  console shell can be screenshotted without production credentials. */
const now = () => Math.floor(Date.now() / 1000)
const USER = {
  id: 1,
  username: 'preview',
  display_name: '预览用户',
  email: 'preview@example.com',
  role: 1,
  status: 1,
  group: '国模分组',
  quota: 49215000,
  used_quota: 26615000,
  request_count: 2488,
  aff_code: 'PREVIEW',
  aff_count: 3,
  aff_quota: 5000000,
  aff_history_quota: 12000000,
  has_password: true,
  sidebar_modules: '{}',
}
const SESSION = {
  sid: 'preview-session',
  current: true,
  login_method: 'password',
  ip: '127.0.0.1',
  user_agent: 'preview',
  created_at: now() - 600,
  last_active_at: now(),
  expires_at: now() + 86400,
}
const BUNDLE = {
  access_token: 'preview-access-token',
  token_type: 'Bearer',
  access_expires_at: now() + 3600,
  user: USER,
  session: SESSION,
}

function isAuthed(req) {
  return (
    process.env.PREVIEW_AUTH === '1' ||
    /(?:^|;\s*)preview_auth=1(?:;|$)/.test(req.headers.cookie || '')
  )
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(payload)
}

/** 应用读的是 response.data，所以每个 mock 都要带这层信封。 */
const ok = (data) => ({ success: true, message: '', data })

function sendFile(res, file, contentType) {
  if (!fs.existsSync(file)) {
    res.writeHead(404).end('not found')
    return
  }
  res.writeHead(200, {
    'content-type':
      contentType || MIME[path.extname(file)] || 'application/octet-stream',
    'cache-control': 'no-store',
  })
  fs.createReadStream(file)
    .on('error', () => res.destroy())
    .pipe(res)
}

// 品牌资源由 Caddy 在线上接管，本地回放同一份文件，避免页面上的 logo 404
const BRAND_ROUTES = new Map([
  ['/brand/logo.svg', 'brand/logo.svg'],
  ['/brand/wx-group-qr.jpg', 'brand/wx-group-qr.jpg'],
  ['/brand/wecom-qr.jpg', 'brand/wecom-qr.jpg'],
  ['/logo.png', 'brand/logo.png'],
  ['/favicon.ico', 'brand/favicon.ico'],
])

function sendFixture(res, relPath) {
  const file = path.join(FIXTURES, relPath)
  if (!fs.existsSync(file)) {
    res.writeHead(404).end('not found')
    return
  }
  const contentType = relPath === 'brand/logo.png' ? 'image/svg+xml' : undefined
  sendFile(res, file, contentType)
}

function sendStatic(res, urlPath) {
  const rel = urlPath.replace(/^\/+/, '')
  const target = path.resolve(DIST, rel)
  if (target !== DIST && !target.startsWith(`${DIST}${path.sep}`)) {
    res.writeHead(403).end('forbidden')
    return
  }
  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    sendFile(res, target)
    return
  }
  if (path.extname(target)) {
    res.writeHead(404).end('not found')
    return
  }
  // SPA routes fall back to index.html; missing assets must return 404.
  sendFile(res, path.join(DIST, 'index.html'))
}

/**
 * Console mocks. Every shape below was taken from the repo's own types, the
 * consuming code, or a literal in its test fixtures — an object where the app
 * expects an array (or vice versa) throws inside useMemo and the error
 * boundary eats the page. Each value is the `data` payload; ok() adds the
 * envelope.
 */
const CONSOLE_ROUTES = {
  // array of QuotaDataItem, NOT an object
  '/api/data/self': [],
  // paged envelope: {items,total,page,page_size}
  '/api/token/': { items: [], total: 0, page: 1, page_size: 10 },
  '/api/user/models': [],
  // plain string — the consumer calls .trim() on it
  '/api/notice': '',
  '/api/log/self': { items: [], total: 0, page: 1, page_size: 20 },
  '/api/log/': { items: [], total: 0, page: 1, page_size: 20 },
  '/api/log/self/stat': { quota: 0, rpm: 0, tpm: 0 },
  '/api/log/stat': { quota: 0, rpm: 0, tpm: 0 },
  '/api/perf-metrics/summary': { models: [] },
  '/api/uptime/status': [],
  '/api/user/aff': '',
  '/api/user/self/groups': {},
  '/api/subscription/plans': [],
  '/api/subscription/self': {
    billing_preference: 'subscription_first',
    subscriptions: [],
    all_subscriptions: [],
  },
  '/api/user/topup/self': { items: [], total: 0 },
  '/api/user/topup/info': {
    enable_online_topup: false,
    enable_stripe_topup: false,
    enable_creem_topup: false,
    enable_waffo_topup: false,
    enable_waffo_pancake_topup: false,
    enable_redemption: true,
    payment_compliance_confirmed: true,
    pay_methods: [],
    creem_products: [],
    waffo_pay_methods: [],
    min_topup: 0,
    stripe_min_topup: 0,
    waffo_min_topup: 0,
    waffo_pancake_min_topup: 0,
    amount_options: [],
    discount: {},
    topup_link: '',
  },
}

if (process.env.PREVIEW_SUBSCRIPTION === '1') {
  const subscriptions = [
    {
      subscription: {
        id: 1,
        user_id: USER.id,
        plan_id: 1,
        status: 'active',
        source: 'purchase',
        start_time: now() - 86400,
        end_time: now() + 29 * 86400,
        amount_total: 15000000,
        amount_used: 332500,
        next_reset_time: now() + 86400,
      },
    },
  ]
  CONSOLE_ROUTES['/api/subscription/self'] = {
    billing_preference: 'subscription_first',
    subscriptions,
    all_subscriptions: subscriptions,
  }
}

/** Admin session for the system-settings preview. Only with PREVIEW_ADMIN=1, so
 *  the ordinary console preview keeps role 1. */
if (process.env.PREVIEW_ADMIN === '1') {
  USER.role = 100
}

/**
 * Group-pricing preview (PREVIEW_ADMIN=1): option values are raw JSON strings,
 * exactly as `GET /api/option/` returns them, so the admin page's own parsing
 * path runs for real. The group set and its order mirror the live site.
 */
const GROUP_RATIO = {
  福利分组: 0.15,
  'Gemini Ultra分组': 1,
  'Pro 20x分组': 0.1,
  国模分组: 0.5,
  特价国模分组: 0.25,
  'Claude Kiro分组': 0.05,
  'Claude Max分组': 0.8,
}
const GROUP_DESCRIPTIONS = {
  福利分组: '来自神秘渠道的福利分组',
  'Gemini Ultra分组': 'Gemini官方订阅渠道',
  'Pro 20x分组': 'ChatGPT官方订阅渠道',
  国模分组: '国产模型渠道',
  特价国模分组: '稳定性欠佳渠道',
  'Claude Kiro分组': '高缓存Kiro渠道',
}

/** Routes that already carry their own {success, data} envelope and must not be
 *  wrapped again by ok(). Filled in by the admin preview below. */
const RAW_ROUTES = {}

// Public configuration is a local snapshot, with remote images and captcha disabled.
const CANNED_ROUTES = {
  '/api/status': STATUS,
  '/api/setup': { success: true, data: { status: true } },
  '/api/home_page_content': ok(''),
}

if (process.env.PREVIEW_ADMIN === '1') {
  const groupNames = Object.keys(GROUP_RATIO)
  const describe = (name) => GROUP_DESCRIPTIONS[name] ?? name
  RAW_ROUTES['/api/user/self/groups'] = {
    success: true,
    message: '',
    data: Object.fromEntries(
      groupNames.map((name) => [
        name,
        { ratio: GROUP_RATIO[name], desc: describe(name) },
      ])
    ),
    group_order: groupNames,
  }
  CONSOLE_ROUTES['/api/group/'] = groupNames
  // Public pricing payload: the model square and its group filter read
  // `usable_group` and `group_order` from here.
  CANNED_ROUTES['/api/pricing'] = {
    success: true,
    data: [],
    vendors: [],
    group_ratio: { ...GROUP_RATIO },
    usable_group: Object.fromEntries(
      groupNames.map((name) => [name, describe(name)])
    ),
    group_order: groupNames,
    supported_endpoint: {},
    auto_groups: [],
  }
  CONSOLE_ROUTES['/api/option/'] = [
    { key: 'GroupRatio', value: JSON.stringify(GROUP_RATIO, null, 2) },
    { key: 'TopupGroupRatio', value: '{}' },
    {
      key: 'UserUsableGroups',
      value: JSON.stringify(GROUP_DESCRIPTIONS, null, 2),
    },
    { key: 'GroupGroupRatio', value: '{}' },
    { key: 'AutoGroups', value: '[]' },
    { key: 'MaxTokenAutoGroups', value: '5' },
    { key: 'DefaultUseAutoGroup', value: 'false' },
    { key: 'group_ratio_setting.group_special_usable_group', value: '{}' },
  ]
}

// 带 preview_auth=1 cookie 时回放假 session，否则 401
const AUTH_ROUTES = {
  '/api/user/auth/refresh': ok(BUNDLE),
  '/api/user/self': ok(USER),
}

// 登录页也得能进去：POST 登录一律回假 session（任何账号密码都算数）。不收下这一步，
// 人肉预览时一旦被弹到 /login 就再也进不来——本地没有 Turnstile、也没有真后端。
const LOGIN_ROUTES = new Set([
  '/api/user/login',
  '/api/user/login/2fa',
  '/api/user/register',
])

function handleApi(req, res, pathname) {
  const methodAllowed =
    req.method === 'GET' ||
    (req.method === 'POST' &&
      (pathname === '/api/user/auth/refresh' || LOGIN_ROUTES.has(pathname)))
  if (!methodAllowed) {
    sendJson(res, 405, { success: false, message: 'read-only preview' })
    return
  }

  if (req.method === 'POST' && LOGIN_ROUTES.has(pathname)) {
    sendJson(res, 200, ok(BUNDLE))
    return
  }

  if (Object.hasOwn(CANNED_ROUTES, pathname)) {
    sendJson(res, 200, CANNED_ROUTES[pathname])
    return
  }

  if (Object.hasOwn(AUTH_ROUTES, pathname)) {
    if (isAuthed(req)) sendJson(res, 200, AUTH_ROUTES[pathname])
    else {
      sendJson(res, 401, { success: false, message: 'unauthorized (preview)' })
    }
    return
  }

  if (Object.hasOwn(RAW_ROUTES, pathname)) {
    if (!isAuthed(req)) {
      sendJson(res, 401, { success: false, message: 'unauthorized (preview)' })
      return
    }
    sendJson(res, 200, RAW_ROUTES[pathname])
    return
  }

  if (isAuthed(req) && Object.hasOwn(CONSOLE_ROUTES, pathname)) {
    sendJson(res, 200, ok(CONSOLE_ROUTES[pathname]))
    return
  }

  // 其余一律本地空响应 —— 预览页上的任何点击都不会打到线上去
  if (req.method === 'GET') {
    sendJson(res, 200, ok(null))
    return
  }
  sendJson(res, 405, { success: false, message: 'read-only preview' })
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`)
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname)
    return
  }
  const brand = BRAND_ROUTES.get(pathname)
  if (brand) {
    sendFixture(res, brand)
    return
  }
  sendStatic(res, pathname)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`本地预览已启动：http://127.0.0.1:${server.address().port}/`)
  console.log('（web/dist + 本地配置快照与假会话；外部链接仅在主动点击时跳转）')
})
