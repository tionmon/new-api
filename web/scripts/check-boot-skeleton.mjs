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
/*
Verifies the first-paint skeleton in `web/index.html`.

The skeleton exists to cover the window between the HTML arriving and React
mounting, which is the whole reason it must be *self-contained*: if it needed
the stylesheet or the bundle, it would arrive with the thing it is covering.

So the interesting case is the one where both are blocked. With `/static/js/**`
and `/static/css/**` answered 404, the page must still show a themed, centred
loading state — and once the bundle is allowed through, React's first commit
must take it away again.

The geometry is read from `getBoundingClientRect` rather than judged from a
screenshot: a 15px offset is invisible in a thumbnail and obvious in numbers.
The probe is injected into the response by this script's own server, so the
tracked `index.html` stays exactly what ships.

Usage: node scripts/check-boot-skeleton.mjs
Env:   CHROME_PATH  path to Chrome/Chromium (defaults to the usual macOS path)
*/
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as pause } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(HERE, '..', 'dist')
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!fs.existsSync(DIST)) {
  throw new Error(`${DIST} is missing — run \`bun run build\` first`)
}
if (!fs.existsSync(CHROME)) {
  throw new Error('Set CHROME_PATH to an installed Chrome or Chromium binary')
}

const BASIC_TYPES = {
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

let failures = 0

function check(ok, label, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures += 1
}

/*
Reads the skeleton's box, its computed style and the handful of document facts
the assertions need. Written to `document.title` because that is the one channel
`--dump-dom` gives back without a full CDP session.
*/
const PROBE = `<script>
setTimeout(function () {
  var ids = ['boot-skeleton', 'boot-skeleton-name', 'boot-skeleton-spinner', 'boot-skeleton-label'];
  var out = { vw: innerWidth, vh: innerHeight, htmlClass: document.documentElement.className,
    bootLang: document.documentElement.getAttribute('data-boot-lang'), title: document.title };
  out.items = {};
  ids.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) { out.items[id] = null; return }
    var r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    out.items[id] = { x: r.x, y: r.y, w: r.width, h: r.height,
      cx: r.x + r.width / 2, cy: r.y + r.height / 2,
      display: cs.display, backgroundColor: cs.backgroundColor, text: (el.textContent || '').trim() };
  });
  var root = document.getElementById('root');
  out.rootChildren = root ? root.children.length : -1;
  document.title = 'PROBE' + JSON.stringify(out);
}, 1500);
</script>`

function startServer({ blockAssets, theme }) {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://127.0.0.1')
    const send = (status, type, body) => {
      const headers = { 'content-type': type }
      // The theme the app itself reads, so the skeleton is exercised through the
      // real input rather than by forcing a class into the markup.
      if (theme) headers['set-cookie'] = `vite-ui-theme=${theme}; Path=/`
      response.writeHead(status, headers)
      response.end(body)
    }
    if (blockAssets && /^\/static\/(js|css)\//.test(pathname)) {
      send(404, 'text/plain', 'blocked')
      return
    }
    try {
      const file = path.join(
        DIST,
        path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
      )
      let body = fs.readFileSync(file)
      if (path.extname(file) === '.html') {
        body = Buffer.from(
          body.toString('utf8').replace('</body>', `${PROBE}</body>`)
        )
      }
      send(
        200,
        BASIC_TYPES[path.extname(file)] || 'application/octet-stream',
        body
      )
    } catch {
      const body = fs
        .readFileSync(path.join(DIST, 'index.html'), 'utf8')
        .replace('</body>', `${PROBE}</body>`)
      send(200, 'text/html; charset=utf-8', body)
    }
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port })
    })
  })
}

async function readDom({ blockAssets, theme, size, tag }) {
  const { server, port } = await startServer({ blockAssets, theme })
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tokenmetro-sk-'))
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--window-size=${size}`,
    '--virtual-time-budget=12000',
    `--user-data-dir=${profile}`,
  ]
  args.push('--dump-dom', `http://127.0.0.1:${port}/`)

  const chrome = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'ignore'] })
  let dom = ''
  chrome.stdout.on('data', (chunk) => {
    dom += chunk
  })
  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      chrome.kill('SIGKILL')
      resolve()
    }, 60000)
    chrome.on('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
  server.close()
  fs.rmSync(profile, { recursive: true, force: true })
  await pause(150)

  const match = dom.match(/<title>PROBE(.*?)<\/title>/s)
  if (!match) {
    throw new Error(`${tag}: the probe never reported (title unchanged)`)
  }
  return JSON.parse(match[1])
}

const near = (actual, expected, tolerance = 2) =>
  Math.abs(actual - expected) <= tolerance

console.log('First-paint skeleton\n')

// --- 1. Without the stylesheet or the bundle, the skeleton still has to work ---
const bare = await readDom({
  blockAssets: true,
  size: '1440,900',
  tag: 'no-assets',
})
const frame = bare.items['boot-skeleton']
const spinner = bare.items['boot-skeleton-spinner']
const label = bare.items['boot-skeleton-label']
const name = bare.items['boot-skeleton-name']

check(
  frame?.display === 'flex' && near(frame.w, bare.vw) && near(frame.h, bare.vh),
  'with JS and CSS blocked the skeleton fills the viewport',
  `display=${frame?.display} ${Math.round(frame?.w)}x${Math.round(frame?.h)} vs ${bare.vw}x${bare.vh}`
)
check(
  spinner &&
    label &&
    near(spinner.cx, bare.vw / 2) &&
    near(label.cx, bare.vw / 2),
  'the spinner and the label sit on the viewport centre axis',
  `spinner dx=${(spinner.cx - bare.vw / 2).toFixed(1)} label dx=${(label.cx - bare.vw / 2).toFixed(1)}`
)
check(
  name?.display === 'none',
  'the site-name line collapses when no cached name exists',
  `display=${name?.display}`
)
check(
  label?.text === (bare.bootLang === 'zh' ? '正在加载…' : 'Loading…') &&
    bare.bootLang,
  'the label matches the language the page detected',
  `lang=${bare.bootLang} text=${JSON.stringify(label?.text)}`
)
check(
  bare.rootChildren === 0,
  'the skeleton is not inside #root, so the handoff cannot disturb React',
  `#root children=${bare.rootChildren}`
)

// --- 2. Theme: the background must follow the visitor's choice, not the default ---
const light = await readDom({
  blockAssets: true,
  theme: 'light',
  size: '1440,900',
  tag: 'light',
})
const dark = await readDom({
  blockAssets: true,
  theme: 'dark',
  size: '1440,900',
  tag: 'dark',
})
const lightBg = light.items['boot-skeleton']?.backgroundColor
const darkBg = dark.items['boot-skeleton']?.backgroundColor
check(
  light.items['boot-skeleton'] &&
    dark.items['boot-skeleton'] &&
    lightBg !== darkBg,
  'the skeleton background follows the theme cookie with no stylesheet loaded',
  `light=${lightBg} dark=${darkBg}`
)
check(
  light.htmlClass?.includes('light') && dark.htmlClass?.includes('dark'),
  'the theme class is on <html> before the first paint',
  `light="${light.htmlClass}" dark="${dark.htmlClass}"`
)

// --- 3. The mobile width must not push anything off-screen ---
const mobile = await readDom({
  blockAssets: true,
  size: '390,844',
  tag: 'mobile',
})
const mobileLabel = mobile.items['boot-skeleton-label']
check(
  mobileLabel && near(mobileLabel.cx, mobile.vw / 2) && mobileLabel.x >= 0,
  'the skeleton stays centred at a mobile width',
  `viewport=${mobile.vw} label dx=${(mobileLabel.cx - mobile.vw / 2).toFixed(1)} x=${mobileLabel.x.toFixed(1)}`
)

// --- 4. With the bundle allowed through, React's first commit takes it away ---
const mounted = await readDom({
  blockAssets: false,
  size: '1440,900',
  tag: 'mounted',
})
check(
  mounted.rootChildren > 0,
  'React mounts content into #root',
  `#root children=${mounted.rootChildren}`
)
check(
  mounted.items['boot-skeleton']?.display === 'none',
  'the skeleton is gone once React has rendered (CSS :has handoff)',
  `display=${mounted.items['boot-skeleton']?.display}`
)

if (failures > 0) {
  console.error(`\n${failures} skeleton check(s) failed.`)
  process.exit(1)
}
console.log('\nAll skeleton checks passed.')
