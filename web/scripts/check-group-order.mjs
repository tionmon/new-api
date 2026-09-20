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
/**
 * 分组定价排序功能的本地截图与自检。
 *
 * 用途：改动后不改生产、不需要真实后台凭据，就能看到「分组定价」页的
 * 排序交互（拖拽把手 + 上/下移按钮）真实渲染结果，并验证移动一行之后
 * 写回的 GroupOrder 与用户侧接口带出的顺序一致。
 *
 * 运行（在 web/ 目录下，先 bun run build）：
 *   node scripts/check-group-order.mjs
 * SCREENSHOT_DIR 可指定截图输出目录；CHROME_PATH 可指定本机 Chrome。
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as pause } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))

// 断言界面文案时按键从语言包取值，而不是把某一种语言的展示文案写死在这里
// （界面文案会翻译、会改写，键才是契约；见 web/AGENTS.md §3.14）。预览服务渲染
// 的是中文，所以查中文包。
const ZH_DICTIONARY = JSON.parse(
  fs.readFileSync(path.join(HERE, '../src/i18n/locales/zh.json'), 'utf8')
).translation
const zhLabel = (key) => ZH_DICTIONARY[key] ?? key

// 按钮定位同样走语言包：把中文文案写死在断言里，界面一改文案就假红。
const zhButtonPattern = (key) =>
  `/${zhLabel(key).replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`
const CHROME = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((candidate) => candidate && fs.existsSync(candidate))
if (!CHROME) {
  throw new Error('Set CHROME_PATH to an installed Chrome or Chromium binary')
}

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tokenmetro-group-'))
const screenshotDir =
  process.env.SCREENSHOT_DIR || path.join(profile, 'screenshots')
fs.mkdirSync(screenshotDir, { recursive: true })

const GROUP_PRICING_ROUTE = '/system-settings/billing/group-pricing'
const groupOrderNames = [
  '福利分组',
  'Gemini Ultra分组',
  'Pro 20x分组',
  '国模分组',
  '特价国模分组',
  'Claude Kiro分组',
  'Claude Max分组',
]
const children = []
const errors = []
let failed = 0
let ws

function check(ok, label, detail = '') {
  console.log(`${ok ? 'ok' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}

async function until(read, label, timeout = 20000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const value = await read()
    if (value) return value
    await pause(50)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })
  child.on('error', (error) => errors.push(error.message))
  children.push(child)
  return child
}

try {
  let previewOutput = ''
  const preview = start(
    process.execPath,
    [path.join(HERE, 'home-preview.mjs')],
    {
      env: {
        ...process.env,
        PORT: '0',
        PREVIEW_AUTH: '0',
        PREVIEW_ADMIN: '1',
        PREVIEW_SUBSCRIPTION: '1',
      },
    }
  )
  preview.stdout.on('data', (chunk) => (previewOutput += chunk))
  preview.stderr.on('data', (chunk) => (previewOutput += chunk))
  const origin = await until(() => {
    if (preview.exitCode !== null) throw new Error(previewOutput)
    return previewOutput.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0]
  }, 'preview server')

  const chrome = start(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--disable-background-networking',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ])
  const portFile = path.join(profile, 'DevToolsActivePort')
  const cdpPort = await until(() => {
    if (chrome.exitCode !== null) throw new Error('Chrome exited early')
    if (!fs.existsSync(portFile)) return null
    return Number(fs.readFileSync(portFile, 'utf8').split('\n')[0])
  }, 'Chrome debugging port')
  const pages = await (
    await fetch(`http://127.0.0.1:${cdpPort}/json/list`)
  ).json()
  const page = pages.find((item) => item.type === 'page')
  if (!page) throw new Error('Chrome did not create a page')
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await once(ws, 'open')

  let serial = 0
  const pending = new Map()
  /** PUT bodies captured from the page, so the saved order can be asserted. */
  const optionWrites = []
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++serial
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }, 20000)
      pending.set(id, { resolve, reject, timer })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const task = pending.get(message.id)
      if (!task) return
      clearTimeout(task.timer)
      pending.delete(message.id)
      if (message.error) task.reject(new Error(message.error.message))
      else task.resolve(message.result)
      return
    }
    if (message.method === 'Runtime.exceptionThrown') {
      errors.push(
        message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text
      )
    }
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params
      const sameOrigin = request.url.startsWith(`${origin}/`)
      const isOptionWrite =
        sameOrigin &&
        new URL(request.url).pathname === '/api/option/' &&
        request.method === 'PUT'
      if (isOptionWrite && request.postData) {
        optionWrites.push(JSON.parse(request.postData))
        void send('Fetch.fulfillRequest', {
          requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'content-type', value: 'application/json' },
          ],
          body: Buffer.from(
            JSON.stringify({ success: true, message: '' })
          ).toString('base64'),
        }).catch((error) => errors.push(error.message))
        return
      }
      void send(
        sameOrigin ? 'Fetch.continueRequest' : 'Fetch.failRequest',
        sameOrigin
          ? { requestId }
          : { requestId, errorReason: 'BlockedByClient' }
      ).catch((error) => errors.push(error.message))
    }
  })

  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text
      )
    }
    return result.result.value
  }
  async function viewport(width, height, mobile = false) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    })
  }
  async function capture(name) {
    const image = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
    })
    fs.writeFileSync(
      path.join(screenshotDir, `${name}.png`),
      Buffer.from(image.data, 'base64')
    )
  }
  async function navigate(route, selector) {
    await send('Page.navigate', { url: origin + route })
    await until(async () => {
      try {
        return await evaluate(
          `location.pathname === ${JSON.stringify(route)} && document.readyState === 'complete' && !!document.querySelector(${JSON.stringify(selector)})`
        )
      } catch {
        return false
      }
    }, `route ${route}`)
    await evaluate(
      `document.fonts.ready.then(() => Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})))).then(() => true)`
    )
  }

  /** Clicks the element a finder expression resolves to. */
  async function click(finder) {
    const point = await evaluate(`(() => {
      const element = ${finder};
      if (!element) throw new Error('Missing click target: ' + ${JSON.stringify(finder)});
      element.scrollIntoView({block:'center'});
      const r = element.getBoundingClientRect();
      return {x:r.left+r.width/2,y:r.top+r.height/2};
    })()`)
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      ...point,
      button: 'left',
      clickCount: 1,
    })
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      ...point,
      button: 'left',
      clickCount: 1,
    })
  }

  /** Finder for click(): the first element matching a CSS selector. */
  function bySelector(selector) {
    return `document.querySelector(${JSON.stringify(selector)})`
  }

  /** Finder for click(): the first button whose text matches, reporting the
   *  labels on screen when none does. */
  function byButtonText(pattern) {
    return `(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const found = buttons.find(b => ${pattern}.test(b.textContent || ''));
    if (found) return found;
    const labels = buttons.map(b => (b.textContent || '').trim()).filter(Boolean);
    throw new Error('No button matching ' + ${JSON.stringify(pattern)} + ' — saw: ' + JSON.stringify(labels));
  })()`
  }

  /** Group-name column of the pricing table, top to bottom. */
  function readTableGroupNames() {
    return evaluate(
      `Array.from(document.querySelectorAll('#group-pricing-order-affordance tbody tr')).map(row => row.querySelector('input')?.value ?? '')`
    )
  }

  /**
   * Drags a row's sort handle onto another row using plain pointer events.
   *
   * Rows are reordered by motion's Reorder, which listens to pointerdown/move/up —
   * not to the browser's native drag-and-drop — so there is no drag interception
   * here. Driving the same events a finger or mouse produces also means this test
   * fails if the row stops following the pointer.
   *
   * Returns the vertical offsets sampled mid-drag, per row, so the caller can assert
   * that the dragged row actually moved with the cursor.
   */
  async function rowOffsetsFromRest() {
    return evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('#group-pricing-order-affordance tbody tr'));
      return rows.map(row => {
        const transform = getComputedStyle(row).transform;
        if (!transform || transform === 'none') return 0;
        return Math.round(new DOMMatrixReadOnly(transform).m42);
      });
    })()`)
  }

  async function dragRowHandle(from, to) {
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: from.x,
      y: from.y,
      button: 'left',
      clickCount: 1,
      buttons: 1,
    })
    const path = [
      [from.x, from.y + 8],
      [from.x, from.y + 24],
      [Math.round((from.x + to.x) / 2), Math.round((from.y + to.y) / 2)],
      [to.x, to.y],
    ]
    const samples = []
    for (const [x, y] of path) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x,
        y,
        button: 'left',
        buttons: 1,
      })
      await pause(120)
      samples.push(await rowOffsetsFromRest())
    }
    const offsets = samples.at(-1) ?? []
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: to.x,
      y: to.y,
      button: 'left',
      clickCount: 1,
      buttons: 0,
    })
    await pause(450)
    return { offsets, samples }
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Fetch.enable', {
    patterns: [{ urlPattern: 'http*', requestStage: 'Request' }],
  })
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  await send('Network.setCookie', {
    name: 'preview_auth',
    value: '1',
    url: origin,
  })

  // ---- The admin table renders, in order, with sort affordances ----
  await viewport(1680, 1050)
  await navigate(GROUP_PRICING_ROUTE, '#group-pricing-order-affordance')

  const noteLabel = zhLabel(
    'Users pick groups in this order. It does not change the auto group routing priority.'
  )
  const initial = await evaluate(`(() => {
    const table = document.querySelector('#group-pricing-order-affordance');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    // Labels are localized, so target the controls positionally: the first two
    // buttons in the sort cell are move-up and move-down.
    const buttonsOf = row => Array.from(row.querySelectorAll('button'));
    return {
      handles: rows.every(row => row.querySelector('svg.lucide-grip-vertical')),
      upDisabled: buttonsOf(rows[0])[0]?.disabled === true,
      downDisabled: buttonsOf(rows.at(-1))[1]?.disabled === true,
      upEnabled: buttonsOf(rows[1])[0]?.disabled === false,
      sortHeader: table.querySelector('thead th')?.textContent?.trim(),
      note: document.body.innerText.includes(${JSON.stringify(noteLabel)}),
    };
  })()`)
  const initialNames = await readTableGroupNames()
  check(
    initialNames.length === 7 &&
      initialNames[0] === '福利分组' &&
      initialNames[6] === 'Claude Max分组',
    'table lists all seven groups in the stored order',
    initialNames.join(' → ')
  )
  check(initial.handles, 'every row has a drag handle')
  check(
    initial.upDisabled && initial.downDisabled && initial.upEnabled,
    'up is disabled on the first row, down on the last, and enabled in between',
    JSON.stringify({
      upDisabled: initial.upDisabled,
      downDisabled: initial.downDisabled,
      upEnabled: initial.upEnabled,
    })
  )
  check(
    initial.sortHeader === zhLabel('Sort Order'),
    'the sort column is present',
    initial.sortHeader
  )
  check(initial.note, 'the display-order note is shown')
  await capture('group-pricing-desktop')

  // ---- JSON mode exposes the same order as a plain array ----
  await click(byButtonText(zhButtonPattern('Switch to JSON')))
  const jsonMode = await evaluate(`(() => {
    const field = document.querySelector('textarea[name="GroupOrder"]');
    if (!field) return {found: false};
    return {found: true, value: field.value.replace(/\\s+/g, '')};
  })()`)
  check(
    jsonMode.found && jsonMode.value === '[]',
    'JSON mode exposes the stored group order',
    JSON.stringify(jsonMode)
  )
  await click(byButtonText(zhButtonPattern('Switch to Visual')))

  // ---- Moving the second row up rewrites GroupOrder, and the users' order follows ----
  await click(
    bySelector('#group-pricing-order-affordance tbody tr:nth-child(2) button')
  )
  const afterMove = await readTableGroupNames()
  check(
    afterMove[0] === 'Gemini Ultra分组' && afterMove[1] === '福利分组',
    'moving a group up swaps it with the row above',
    afterMove.join(' → ')
  )

  await click(byButtonText(zhButtonPattern('Save group ratios')))
  const orderWrite = await until(
    () => optionWrites.find((write) => write.key === 'GroupOrder'),
    'GroupOrder write',
    10000
  )
  check(
    JSON.stringify(JSON.parse(orderWrite.value)) ===
      JSON.stringify([
        'Gemini Ultra分组',
        '福利分组',
        'Pro 20x分组',
        '国模分组',
        '特价国模分组',
        'Claude Kiro分组',
        'Claude Max分组',
      ]),
    'saving persists the new group order',
    orderWrite.value
  )

  // /api/user/self/groups keeps its map payload and adds the order array; this is
  // what the keys drawer, playground and pricing filters consume.
  const served = await (
    await fetch(`${origin}/api/user/self/groups`, {
      headers: { cookie: 'preview_auth=1' },
    })
  ).json()
  check(
    Object.keys(served.data ?? {}).length === 7 &&
      Array.isArray(served.group_order) &&
      served.group_order.length === 7,
    'user-facing groups payload carries the map plus the order array',
    `groups=${Object.keys(served.data ?? {}).length} order=${JSON.stringify(served.group_order)}`
  )

  // ---- Dragging a handle onto another row reorders the rows the same way ----
  const dragFrom = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('#group-pricing-order-affordance tbody tr'));
    const centre = el => { const r = el.getBoundingClientRect(); return {x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)} };
    return {
      handle: centre(rows[0].querySelector('svg.lucide-grip-vertical').parentElement),
      to: (() => { const r = rows[2].getBoundingClientRect(); return {x: Math.round(r.left + r.width/2), y: Math.round(r.bottom + 6)}; })(),
    };
  })()`)
  const beforeDrag = await readTableGroupNames()
  const { offsets: midDragOffsets, samples: midDragSamples } =
    await dragRowHandle(dragFrom.handle, dragFrom.to)
  const afterDrag = await readTableGroupNames()
  check(
    midDragOffsets.some((offset) => Math.abs(offset) > 8),
    'the dragged row is translated away from its resting position mid-drag',
    `offsets=${JSON.stringify(midDragOffsets)} samples=${JSON.stringify(midDragSamples)}`
  )
  check(
    JSON.stringify(afterDrag) ===
      JSON.stringify([
        beforeDrag[1],
        beforeDrag[2],
        beforeDrag[0],
        ...beforeDrag.slice(3),
      ]),
    'dragging a row handle reorders the table',
    `${beforeDrag.slice(0, 3).join(' → ')}  ⇒  ${afterDrag.slice(0, 3).join(' → ')}`
  )

  // ---- The user-facing model square lists groups in the admin's order ----
  await viewport(1440, 900)
  await navigate('/pricing', 'aside')
  const userSide = await evaluate(`(() => {
    // Group chips render as "<name><ratio suffix>" and the DOM collapses spacing,
    // so compare on a whitespace-free form of both sides.
    const squash = value => value.replace(/\\s+/g, '');
    const known = ${JSON.stringify(groupOrderNames)}.map(name => ({name, key: squash(name)}));
    const labels = Array.from(document.querySelectorAll('aside button'))
      .map(node => squash(node.textContent || ''));
    const seen = [];
    for (const label of labels) {
      const match = known.find(candidate => label.startsWith(candidate.key));
      if (match && !seen.includes(match.name)) seen.push(match.name);
    }
    return {seen};
  })()`)
  check(
    JSON.stringify(userSide.seen) === JSON.stringify(groupOrderNames),
    'model square group filter follows the group order',
    userSide.seen.join(' → ')
  )
  await capture('pricing-group-filter-desktop')

  // ---- Mobile: the sort controls must not overflow ----
  await viewport(390, 844, true)
  await navigate(GROUP_PRICING_ROUTE, '#group-pricing-order-affordance')
  const mobile = await evaluate(`(() => {
    const table = document.querySelector('#group-pricing-order-affordance');
    const host = table.closest('div');
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      tableScrolls: host.scrollWidth > host.clientWidth,
    };
  })()`)
  check(
    !mobile.overflow,
    'no page-level horizontal overflow at 390px',
    JSON.stringify(mobile)
  )
  await capture('group-pricing-mobile')

  check(
    errors.length === 0,
    'no runtime exceptions',
    errors.slice(0, 3).join(' | ')
  )
  console.log(`\nScreenshots: ${screenshotDir}`)
  console.log(
    failed === 0 ? 'All group-order checks passed' : `${failed} check(s) failed`
  )
} finally {
  try {
    ws?.close()
  } catch {}
  for (const child of children) child.kill('SIGTERM')
}

if (failed > 0) process.exitCode = 1
