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
// Run after `bun run build`. CHROME_PATH can point to a local Chromium binary.
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as pause } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const CHROME = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  process.env.PROGRAMFILES &&
    path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
].find((candidate) => candidate && fs.existsSync(candidate))
if (!CHROME) {
  throw new Error('Set CHROME_PATH to an installed Chrome or Chromium binary')
}

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tokenmetro-browser-'))
const screenshotDir =
  process.env.SCREENSHOT_DIR || path.join(profile, 'screenshots')
fs.mkdirSync(screenshotDir, { recursive: true })
const children = []
const errors = []
const externalRequests = new Set()
let failed = 0
let ws

function check(ok, label, detail = '') {
  console.log(`${ok ? 'ok' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}

async function until(read, label, timeout = 15000) {
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
        PREVIEW_SUBSCRIPTION: '1',
      },
    }
  )
  preview.stdout.on('data', (chunk) => {
    previewOutput += chunk
  })
  preview.stderr.on('data', (chunk) => {
    previewOutput += chunk
  })
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
    if (chrome.exitCode !== null) {
      throw new Error('Chrome exited before opening a debugging port')
    }
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
  let walletUser = null
  let walletUnavailable = false
  let holdRedemption = false
  let pausedRedemption = null
  const redemptionRequests = []
  const pending = new Map()
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++serial
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }, 15000)
      pending.set(id, { resolve, reject, timer })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }
  function fulfillJson(requestId, body) {
    return send('Fetch.fulfillRequest', {
      requestId,
      responseCode: 200,
      responseHeaders: [{ name: 'content-type', value: 'application/json' }],
      body: Buffer.from(JSON.stringify(body)).toString('base64'),
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
    } else if (message.method === 'Runtime.exceptionThrown') {
      errors.push(
        message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text
      )
    } else if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params
      const local = request.url.startsWith(`${origin}/`)
      if (local && walletUser) {
        const pathname = new URL(request.url).pathname
        if (pathname === '/api/user/self') {
          void fulfillJson(requestId, {
            success: true,
            data: walletUser,
          }).catch((error) => errors.push(error.message))
          return
        }
        if (pathname === '/api/user/topup/info' && walletUnavailable) {
          void fulfillJson(requestId, {
            success: true,
            data: {
              enable_redemption: false,
              payment_compliance_confirmed: false,
              enable_online_topup: false,
              enable_stripe_topup: false,
              pay_methods: [],
              min_topup: 0,
              stripe_min_topup: 0,
              amount_options: [],
              discount: {},
            },
          }).catch((error) => errors.push(error.message))
          return
        }
        if (pathname === '/api/user/topup' && request.method === 'POST') {
          redemptionRequests.push(JSON.parse(request.postData || '{}'))
          if (holdRedemption) pausedRedemption = requestId
          else {
            void fulfillJson(requestId, {
              success: false,
              message: 'PREVIEW_INVALID_CODE',
            }).catch((error) => errors.push(error.message))
          }
          return
        }
      }
      if (!local) externalRequests.add(request.url)
      void send(
        local ? 'Fetch.continueRequest' : 'Fetch.failRequest',
        local ? { requestId } : { requestId, errorReason: 'BlockedByClient' }
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
  async function navigate(route, selector) {
    await send('Page.navigate', { url: origin + route })
    await until(async () => {
      try {
        return await evaluate(
          `location.pathname === ${JSON.stringify(route.split('?')[0])} && document.readyState === 'complete' && !!document.querySelector(${JSON.stringify(selector)})`
        )
      } catch {
        return false
      }
    }, `route ${route}`)
    await evaluate(
      `document.fonts.ready.then(() => Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})))).then(() => true)`
    )
  }
  async function viewport(width, height) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
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
  async function click(selector) {
    const point = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) throw new Error('Missing click target');
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
  async function enterCode(code) {
    await click('#redemption-code')
    await evaluate(`document.querySelector('#redemption-code').select()`)
    await send('Input.insertText', { text: code })
    await until(
      () =>
        evaluate(
          `document.querySelector('#redemption-code').value === ${JSON.stringify(code)}`
        ),
      'code input'
    )
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Fetch.enable', {
    patterns: [{ urlPattern: 'http*', requestStage: 'Request' }],
  })
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  })
  await viewport(1440, 900)
  await navigate('/', '#hero-title')
  const delays = await evaluate(
    `Array.from(document.querySelectorAll('[aria-labelledby="hero-title"] .animate-hero-enter'), e => getComputedStyle(e).animationDelay)`
  )
  check(
    JSON.stringify(delays) ===
      JSON.stringify(['0s', '0.09s', '0.17s', '0.23s', '0.31s']),
    'hero stagger',
    delays.join(' / ')
  )

  for (const theme of ['light', 'dark']) {
    await send('Network.setCookie', {
      name: 'vite-ui-theme',
      value: theme,
      url: origin,
    })
    for (const language of ['zh', 'en']) {
      await evaluate(
        `localStorage.setItem('i18nextLng', ${JSON.stringify(language)})`
      )
      for (const [width, height] of [
        [1440, 900],
        [1440, 600],
        [320, 568],
        [390, 844],
        [768, 600],
        [640, 600],
        [568, 280],
      ]) {
        await viewport(width, height)
        await navigate('/', '#hero-title')
        const layout = await evaluate(`(() => {
          const hero = document.querySelector('[aria-labelledby="hero-title"]');
          const copy = document.querySelector('#hero-title').parentElement;
          const disclaimer = hero.querySelector('.custom-footer');
          const rail = disclaimer.parentElement;
          const status = rail.querySelector('a');
          const legal = rail.lastElementChild;
          const rect = e => { const r = e.getBoundingClientRect(); return {left:r.left, right:r.right, top:r.top, bottom:r.bottom} };
          const overlaps = (a,b) => a.left < b.right-1 && a.right > b.left+1 && a.top < b.bottom-1 && a.bottom > b.top+1;
          const c = rect(copy), d = rect(disclaimer), s = rect(status), l = rect(legal), h = rect(document.querySelector('header'));
          const roster = hero.querySelector('.hero-band-outline').closest('.animate-hero-breathe-alt');
          const pills = Array.from(copy.querySelectorAll('a'), e => ({height:e.getBoundingClientRect().height, radius:parseFloat(getComputedStyle(e).borderRadius)}));
          return {collisions:[overlaps(d,s)&&'disclaimer/status', overlaps(d,l)&&'disclaimer/legal', overlaps(c,h)&&'copy/header', overlaps(c,d)&&'copy/footer', overlaps(c,rect(roster))&&'copy/roster'].filter(Boolean), overflow:document.documentElement.scrollWidth > innerWidth, pills};
        })()`)
        check(
          !layout.overflow &&
            layout.collisions.length === 0 &&
            layout.pills.length === 2 &&
            layout.pills.every((p) => p.height >= 44 && p.radius > 100),
          `${theme}/${language} ${width}x${height}`,
          JSON.stringify(layout)
        )
        if (
          language === 'zh' &&
          (width === 1440 || width === 390 || width === 568)
        ) {
          await capture(`home-${theme}-${width}x${height}`)
        }
        if (width === 320 && language === 'en') {
          await capture(`home-${theme}-en-${width}x${height}`)
        }
      }
    }
    await viewport(1440, 900)
    await navigate('/', '#hero-title')
    await send('DOM.enable')
    await send('CSS.enable')
    const { root } = await send('DOM.getDocument')
    const { nodeIds } = await send('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector: '[aria-labelledby="hero-title"] a[role="button"]',
    })
    for (const [index, nodeId] of nodeIds.entries()) {
      await send('CSS.forcePseudoState', {
        nodeId,
        forcedPseudoClasses: ['hover'],
      })
      await evaluate(
        `Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))).then(() => true)`
      )
      const contrast = await evaluate(`(() => {
        const button = document.querySelectorAll('[aria-labelledby="hero-title"] a[role="button"]')[${index}];
        const style = getComputedStyle(button);
        const canvas = document.createElement('canvas'); canvas.width=1; canvas.height=1;
        const ctx = canvas.getContext('2d');
        const rgba = color => {ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return Array.from(ctx.getImageData(0,0,1,1).data)};
        const ground=rgba(getComputedStyle(button.closest('section')).backgroundColor), bg=rgba(style.backgroundColor), fg=rgba(style.color);
        const background=bg.slice(0,3).map((v,i)=>v*bg[3]/255+ground[i]*(1-bg[3]/255));
        const luminance=c=>c.map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);
        const a=luminance(fg.slice(0,3)), b=luminance(background);
        return {ratio:(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05),color:style.color,background:style.backgroundColor};
      })()`)
      check(
        contrast.ratio >= 4.5,
        `${theme} CTA ${index + 1} hover contrast`,
        JSON.stringify(contrast)
      )
      await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })
    }
  }

  for (const route of ['/', '/pricing']) {
    await navigate(route, 'header')
    const nav = await evaluate(
      `({dead:!!document.querySelector('header a[href="/#solutions"]'), console:document.querySelectorAll('header a[href="/dashboard"]').length})`
    )
    check(
      !nav.dead && nav.console === 1,
      `public navigation ${route}`,
      JSON.stringify(nav)
    )
  }
  await send('Network.setCookie', {
    name: 'preview_auth',
    value: '1',
    url: origin,
  })
  const previewUserResponse = await fetch(`${origin}/api/user/self`, {
    headers: { cookie: 'preview_auth=1' },
  })
  walletUser = (await previewUserResponse.json()).data
  for (const theme of ['light', 'dark']) {
    await send('Network.setCookie', {
      name: 'vite-ui-theme',
      value: theme,
      url: origin,
    })
    for (const language of ['zh', 'en']) {
      await evaluate(
        `localStorage.setItem('i18nextLng', ${JSON.stringify(language)})`
      )
      for (const [width, height] of [
        [1440, 900],
        [390, 844],
      ]) {
        await viewport(width, height)
        await navigate('/wallet', '#redemption-code')
        const wallet = await evaluate(`(() => {
          const card = document.querySelector('#wallet-add-funds');
          const links = Array.from(card.querySelectorAll('a[href^="https://wzyp.cn/item/"]'));
          const productIds=['360gu5','g3cv58','szhv1m','1dlqii'];
          const amounts=[5,20,50,100];
          return {products:links.length===4 && links.every((a,i)=>a.href.endsWith('/'+productIds[i]) && a.textContent.trim()==='¥'+amounts[i] && a.target==='_blank' && a.rel.includes('noopener')),
            fits:card.getBoundingClientRect().right <= innerWidth+1 && card.scrollWidth <= card.clientWidth+1 && document.documentElement.scrollWidth<=innerWidth,
            oldPayment:!!card.querySelector('#topup-amount')};
        })()`)
        check(
          wallet.products && wallet.fits && !wallet.oldPayment,
          `wallet ${theme}/${language} ${width}x${height}`,
          JSON.stringify(wallet)
        )
        if (language === 'zh') {
          await capture(`wallet-${theme}-${width}x${height}`)
        }
      }
    }
  }
  await viewport(1440, 900)
  await navigate('/wallet', '#redemption-code')
  await enterCode('PREVIEW-BAD')
  await click('#wallet-add-funds div.grid > button')
  await until(
    () => evaluate(`document.body.innerText.includes('PREVIEW_INVALID_CODE')`),
    'redemption error message'
  )
  check(
    await evaluate(
      `document.querySelector('#redemption-code').value === 'PREVIEW-BAD' && !document.querySelector('#wallet-add-funds div.grid > button').disabled`
    ),
    'failed redemption keeps code and re-enables submit'
  )
  check(
    redemptionRequests.length === 1 &&
      redemptionRequests[0].key === 'PREVIEW-BAD',
    'redemption sends the entered code to the expected API'
  )

  holdRedemption = true
  await enterCode('PREVIEW-GOOD')
  await click('#wallet-add-funds div.grid > button')
  await until(() => pausedRedemption, 'paused redemption request')
  check(
    await evaluate(
      `document.querySelector('#wallet-add-funds div.grid > button').disabled`
    ),
    'pending redemption disables repeated submission'
  )
  await click('#wallet-add-funds div.grid > button')
  walletUser = { ...walletUser, quota: walletUser.quota + 2500000 }
  await fulfillJson(pausedRedemption, { success: true, data: 2500000 })
  pausedRedemption = null
  holdRedemption = false
  await until(
    () =>
      evaluate(
        `document.querySelector('#redemption-code').value === '' && document.body.innerText.includes('¥103.43')`
      ),
    'successful redemption and balance refresh'
  )
  check(
    redemptionRequests.length === 2,
    'success clears code, refreshes balance, and prevents a duplicate request'
  )
  await capture('wallet-redemption-success')

  await viewport(390, 844)
  await navigate('/wallet', '#redemption-code')
  await click('#wallet-add-funds [data-slot="card-header"] button')
  await until(
    () =>
      evaluate(
        `!!document.querySelector('[role="dialog"]') && document.body.innerText.includes('No billing records found')`
      ),
    'billing history dialog'
  )
  check(
    await evaluate(
      `(() => { const r=document.querySelector('[role="dialog"]').getBoundingClientRect();return r.left>=-1 && r.right<=innerWidth+1 && r.height<=innerHeight; })()`
    ),
    'mobile order history opens inside the viewport'
  )
  await capture('wallet-mobile-history')
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  })
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  })
  await until(
    () => evaluate(`!document.querySelector('[role="dialog"]')`),
    'history dismissed with Escape'
  )
  check(true, 'order history closes with Escape')

  await navigate(
    '/wallet?show_history=true&keep=preview#billing',
    '[role="dialog"]'
  )
  check(
    await evaluate(
      `!new URL(location.href).searchParams.has('show_history') && new URL(location.href).searchParams.get('keep')==='preview' && location.hash==='#billing'`
    ),
    'history deep link opens and preserves other URL state'
  )

  walletUnavailable = true
  await navigate('/wallet', '#wallet-add-funds [role="alert"]')
  check(
    await evaluate(
      `!document.querySelector('#redemption-code') && !document.querySelector('#wallet-add-funds a[href^="https://wzyp.cn/"]')`
    ),
    'disabled redemption hides both purchase links and redemption controls'
  )
  await capture('wallet-mobile-disabled')
  walletUnavailable = false

  await viewport(1440, 900)
  await navigate('/dashboard/overview', 'main')
  check(
    !(await evaluate(
      `document.body.innerText.includes('500') && document.body.innerText.includes('Internal')`
    )),
    'authenticated dashboard renders'
  )
  await capture('dashboard-desktop')
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  await navigate('/', '#hero-title')
  check(
    await evaluate(
      `Array.from(document.querySelectorAll('.animate-hero-enter,.animate-hero-breathe,.animate-hero-breathe-alt'), e=>getComputedStyle(e).animationName).every(name=>name==='none')`
    ),
    'hero respects reduced motion'
  )
  check(errors.length === 0, 'no browser runtime exceptions', errors.join('\n'))
  check(
    externalRequests.size === 0,
    'no automatic external requests',
    [...externalRequests].join(', ')
  )
  console.log(`Screenshots: ${screenshotDir}`)
} catch (error) {
  failed++
  console.error(error)
} finally {
  ws?.close()
  for (const child of children.reverse()) {
    if (child.exitCode !== null || child.signalCode !== null) continue
    const exited = once(child, 'exit')
    child.kill('SIGTERM')
    await Promise.race([exited, pause(3000)])
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL')
      await exited
    }
  }
}
console.log(
  failed ? `${failed} browser checks failed` : 'All browser checks passed'
)
process.exitCode = failed ? 1 : 0
