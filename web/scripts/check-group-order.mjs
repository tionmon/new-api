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
 * 分组定价卡片列表的本地截图与自检。
 *
 * 用途：改动后不改生产、不需要真实后台凭据，就能看到「分组定价」页卡片列表的真实
 * 渲染结果，并验证：卡片序 = 保存下来的 GroupRatio 键序 = 用户侧接口带出的顺序，
 * 一条链上只有一个真相。
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
const LIST = '#group-pricing-order-affordance'
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

// 卡片按分组名找按钮：官方卡片把名字写在 span 的 title 上，控件只认名字。
const cards = `Array.from(document.querySelectorAll('${LIST} > li'))`
const cardNamed = (name) =>
  `${cards}.find(card => card.querySelector('span[title]')?.getAttribute('title') === ${JSON.stringify(name)})`
// 把手是官方卡片里唯一带 cursor-grab 的按钮（图标本身没有类名可认）。
const gripOf = (scope) =>
  `Array.from(${scope}.querySelectorAll('button')).find(button => button.className.includes('cursor-grab'))`
const buttonLabelled = (scope, label) =>
  `Array.from(${scope}.querySelectorAll('button')).find(button => button.getAttribute('aria-label') === ${JSON.stringify(label)})`
// 详情面板里的名字输入框与它的提交键（提交键是输入框的兄弟节点，按文字找会先撞上
// 卡片头部的「添加分组」）。
const NAME_INPUT = `document.querySelector('input[aria-label="' + ${JSON.stringify(zhLabel('Group name'))} + '"]')`
const NAME_COMMIT = `document.querySelector('input[aria-label="' + ${JSON.stringify(zhLabel('Group name'))} + '"]')?.parentElement?.querySelector('button')`

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
      pending.set(id, { resolve, reject, timer, method })
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
      if (message.error) {
        task.reject(new Error(`CDP ${task.method}: ${message.error.message}`))
      } else {
        task.resolve(message.result)
      }
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

  /** Group-name column of the pricing cards, top to bottom. */
  function readCardNames() {
    return evaluate(
      `${cards}.map(card => card.querySelector('span[title]')?.getAttribute('title') ?? '')`
    )
  }

  /**
   * Drags a card's grip onto another card using plain pointer events.
   *
   * Cards are reordered by motion's Reorder, which listens to pointerdown/move/up —
   * not to the browser's native drag-and-drop — so there is no drag interception
   * here. Driving the same events a finger or mouse produces also means this test
   * fails if the card stops following the pointer.
   *
   * Returns the vertical offsets sampled mid-drag, per card, so the caller can
   * assert that the dragged card actually moved with the cursor.
   */
  async function cardOffsetsFromRest() {
    return evaluate(`(() => {
      const cards = ${cards};
      return cards.map(card => {
        const transform = getComputedStyle(card).transform;
        if (!transform || transform === 'none') return 0;
        return Math.round(new DOMMatrixReadOnly(transform).m42);
      });
    })()`)
  }

  async function dragCardGrip(from, to) {
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
      samples.push(await cardOffsetsFromRest())
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

  /** Types into a controlled input the way a keyboard does. */
  async function retype(inputFinder, text) {
    await evaluate(`(() => {
      const input = ${inputFinder};
      if (!input) throw new Error('Missing input');
      input.focus();
      input.select();
      return true;
    })()`)
    await send('Input.insertText', { text })
    await pause(150)
  }

  /** Presses and releases one key, the way a keyboard does. */
  async function pressKey(key) {
    const keyCode = { ArrowUp: 38, ArrowDown: 40, Escape: 27 }[key]
    for (const type of ['keyDown', 'keyUp']) {
      await send('Input.dispatchKeyEvent', {
        type,
        key,
        // code 是键名（用 key 本身），windowsVirtualKeyCode 才是数字。
        code: key,
        windowsVirtualKeyCode: keyCode,
        nativeVirtualKeyCode: keyCode,
      })
    }
    await pause(250)
  }

  /** Escapes out of the detail sheet: while it is open every click outside it
   *  lands on the modal backdrop instead of the control it aimed at. */
  async function closeSheet() {
    await pressKey('Escape')
    await until(
      async () => !(await evaluate(`!!${NAME_INPUT}`)),
      'sheet to close'
    )
    await pause(250)
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

  // ---- The pricing cards render, in order, with sort affordances ----
  await viewport(1680, 1050)
  await navigate(GROUP_PRICING_ROUTE, LIST)

  const noteLabel = zhLabel(
    'Users pick groups in this order. It does not change the auto group routing priority.'
  )
  const LABELS = {
    up: zhLabel('Move {{group}} up'),
    down: zhLabel('Move {{group}} down'),
    details: zhLabel('Details'),
    fields: ['Ratio', 'Top-up ratio', 'User selectable', 'Description'].map(
      zhLabel
    ),
  }
  const initialNames = await readCardNames()
  const initial = await evaluate(`(() => {
    const cards = ${cards};
    const LABELS = ${JSON.stringify(LABELS)};
    const withName = (template, name) => template.replace('{{group}}', name);
    const nameOf = card => card.querySelector('span[title]')?.getAttribute('title') ?? '';
    const button = (card, label) => Array.from(card.querySelectorAll('button'))
      .find(b => b.getAttribute('aria-label') === label) ?? null;
    const cardBy = name => cards.find(card => nameOf(card) === name);
    const labels = Array.from(cards[0].querySelectorAll('span'))
      .map(span => span.textContent?.trim() || '');
    return {
      handles: cards.every(card => !!${gripOf('card')}),
      upDisabled: button(cardBy(nameOf(cards[0])), withName(LABELS.up, nameOf(cards[0])))?.disabled === true,
      downDisabled: button(cardBy(nameOf(cards.at(-1))), withName(LABELS.down, nameOf(cards.at(-1))))?.disabled === true,
      upEnabled: button(cards[1], withName(LABELS.up, nameOf(cards[1])))?.disabled === false,
      fieldLabels: LABELS.fields.filter(label => labels.includes(label)),
      detailButtons: cards.filter(card => !!button(card, LABELS.details)).length,
      note: document.body.innerText.includes(${JSON.stringify(noteLabel)}),
    };
  })()`)
  check(
    initialNames.length === 7 &&
      initialNames[0] === '福利分组' &&
      initialNames[6] === 'Claude Max分组',
    'the card list shows all seven groups in the stored order',
    initialNames.join(' → ')
  )
  check(initial.handles, 'every card has a drag handle')
  const gripShape = await evaluate(`(() => {
    const grip = ${gripOf(`${cardNamed('福利分组')}`)};
    return grip ? { tag: grip.tagName, label: grip.getAttribute('aria-label') || '' } : null;
  })()`)
  check(
    gripShape?.tag === 'BUTTON' && gripShape.label.length > 0,
    'the grip is a labelled button, so reordering is not pointer-only',
    JSON.stringify(gripShape)
  )

  // 方向键：一次只按一个方向，并当场检查卡片确实换了位——「按上再按下回到原样」
  // 这种净零断言，键盘完全失灵时也是绿的。最后还要把顺序按回去，免得影响后面那
  // 几条依赖卡片序的断言。
  const beforeKeys = await readCardNames()
  const focused = await evaluate(`(() => {
    const grip = ${gripOf(`${cards}[1]`)};
    grip.focus();
    return document.activeElement === grip;
  })()`)
  await pressKey('ArrowUp')
  const afterUp = await readCardNames()
  check(
    focused && afterUp[0] === beforeKeys[1] && afterUp[1] === beforeKeys[0],
    'arrow up on the focused grip moves the card one place up',
    `focused=${focused} ${beforeKeys.slice(0, 2).join(' → ')} ⇒ ${afterUp.slice(0, 2).join(' → ')}`
  )
  await pressKey('ArrowDown')
  const afterKeys = await readCardNames()
  check(
    JSON.stringify(afterKeys) === JSON.stringify(beforeKeys),
    'arrow down puts it back where it started',
    `${afterUp.slice(0, 2).join(' → ')} ⇒ ${afterKeys.slice(0, 2).join(' → ')}`
  )
  check(
    initial.upDisabled && initial.downDisabled && initial.upEnabled,
    'up is disabled on the first card, down on the last, and enabled in between',
    JSON.stringify({
      upDisabled: initial.upDisabled,
      downDisabled: initial.downDisabled,
      upEnabled: initial.upEnabled,
    })
  )

  // 四格跨卡片等宽：同一列的控件左边缘必须逐卡片对齐，否则卡片一多就成了锯齿。
  const columns = await evaluate(`(() => {
    const cards = ${cards};
    const lefts = (label) => cards.map(card => {
      const input = card.querySelector('input[aria-label="' + label + '"]');
      return input ? Math.round(input.getBoundingClientRect().left) : null;
    });
    const details = cards.map(card => {
      const button = Array.from(card.querySelectorAll('button'))
        .find(b => b.getAttribute('aria-label') === ${JSON.stringify(LABELS.details)});
      return button ? Math.round(button.getBoundingClientRect().left) : null;
    });
    return {
      ratio: lefts(${JSON.stringify(zhLabel('Ratio'))}),
      topup: lefts(${JSON.stringify(zhLabel('Top-up ratio'))}),
      // 不暴露给用户的分组没有说明信息输入框，只有它有值的那几张算对齐。
      description: lefts(${JSON.stringify(zhLabel('Group description'))}).filter(value => value !== null),
      details,
    };
  })()`)
  const aligned = (values) => values.length > 1 && new Set(values).size === 1
  check(
    aligned(columns.ratio) &&
      aligned(columns.topup) &&
      aligned(columns.description) &&
      columns.ratio[0] !== columns.description[0],
    'the ratio, top-up and description columns line up across every card',
    JSON.stringify(columns)
  )
  check(
    initial.fieldLabels.length === 4 && initial.detailButtons === 7,
    'every card carries the four labelled fields and a details entry',
    JSON.stringify({
      labels: initial.fieldLabels,
      detailButtons: initial.detailButtons,
    })
  )
  check(initial.note, 'the display-order note is shown')
  await capture('group-pricing-desktop')

  // ---- JSON mode exposes the same order as plain keys ----
  // 卡片序必须在切模式之前读：切到 JSON 后卡片列表就不在 DOM 里了。
  const cardsBeforeJson = await readCardNames()
  await click(byButtonText(zhButtonPattern('Switch to JSON')))
  const jsonMode = await evaluate(`(() => {
    const field = document.querySelector('textarea[name="GroupRatio"]');
    if (!field) return {found: false};
    return {found: true, keys: Object.keys(JSON.parse(field.value))};
  })()`)
  // 断言成「与卡片序一致」而不是某个固定数组：这才是这条检查要证明的事——两个
  // 模式看到的是同一个顺序，而顺序本身由 GroupRatio 的键序承载。
  check(
    jsonMode.found &&
      JSON.stringify(jsonMode.keys) === JSON.stringify(cardsBeforeJson),
    'JSON mode shows GroupRatio keys in the card order',
    `${JSON.stringify(jsonMode.keys)}  vs  ${JSON.stringify(cardsBeforeJson)}`
  )
  await click(byButtonText(zhButtonPattern('Switch to Visual')))

  // ---- Moving the second card up rewrites the key order, and the users' order follows ----
  await click(
    `${buttonLabelled(cardNamed('Gemini Ultra分组'), zhLabel('Move {{group}} up').replace('{{group}}', 'Gemini Ultra分组'))}`
  )
  const afterMove = await readCardNames()
  check(
    afterMove[0] === 'Gemini Ultra分组' && afterMove[1] === '福利分组',
    'moving a group up swaps it with the card above',
    afterMove.join(' → ')
  )

  await click(byButtonText(zhButtonPattern('Save group settings')))
  const ratioWrite = await until(
    () => optionWrites.find((write) => write.key === 'GroupRatio'),
    'GroupRatio write',
    10000
  )
  const movedOrder = [
    'Gemini Ultra分组',
    '福利分组',
    'Pro 20x分组',
    '国模分组',
    '特价国模分组',
    'Claude Kiro分组',
    'Claude Max分组',
  ]
  check(
    JSON.stringify(Object.keys(JSON.parse(ratioWrite.value))) ===
      JSON.stringify(movedOrder),
    'saving writes the card order into the GroupRatio keys',
    ratioWrite.value
  )

  // /api/user/self/groups keeps its map payload and carries the order array; this is
  // what the keys drawer, playground and pricing filters consume. 预览不落库，所以
  // 这里只证明信封形状：顺序数组与 map 的键序一致（线上那份由后端从 GroupRatio 键
  // 序现读，见 Go 侧 setting/group_order_test.go）。
  const served = await (
    await fetch(`${origin}/api/user/self/groups`, {
      headers: { cookie: 'preview_auth=1' },
    })
  ).json()
  const servedNames = Object.keys(served.data ?? {})
  check(
    servedNames.length === 7 &&
      Array.isArray(served.group_order) &&
      JSON.stringify(served.group_order) === JSON.stringify(servedNames),
    'the user-facing groups payload carries the map plus a matching order array',
    `groups=${servedNames.length} order=${JSON.stringify(served.group_order)}`
  )

  // ---- Dragging a grip onto another card reorders the cards the same way ----
  await viewport(1440, 1200)
  await evaluate(`(() => {
    const cards = ${cards};
    cards[cards.length - 1]?.scrollIntoView({block: 'end'});
    return true;
  })()`)
  await pause(300)
  const dragFrom = await evaluate(`(() => {
    const cards = ${cards};
    const centre = el => { const r = el.getBoundingClientRect(); return {x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)} };
    return {
      handle: centre(${gripOf(`${cards}[0]`)}),
      to: (() => { const r = cards[cards.length - 1].getBoundingClientRect(); return {x: Math.round(r.left + r.width/2), y: Math.round(r.bottom + 6)}; })(),
    };
  })()`)
  const beforeDrag = await readCardNames()
  const { offsets: midDragOffsets, samples: midDragSamples } =
    await dragCardGrip(dragFrom.handle, dragFrom.to)
  const afterDrag = await readCardNames()
  check(
    midDragOffsets.some((offset) => Math.abs(offset) > 8),
    'the dragged card is translated away from its resting position mid-drag',
    `offsets=${JSON.stringify(midDragOffsets)} samples=${JSON.stringify(midDragSamples)}`
  )
  check(
    JSON.stringify(afterDrag) ===
      JSON.stringify([...beforeDrag.slice(1), beforeDrag[0]]),
    'dragging a grip reorders the cards',
    `${beforeDrag.slice(0, 2).join(' → ')} … ⇒ … ${afterDrag.slice(-2).join(' → ')}`
  )

  // ---- 添加分组：先在详情面板里给新分组起名，名字定了才落卡片 ----
  await viewport(1680, 1050)
  await navigate(GROUP_PRICING_ROUTE, LIST)
  await click(byButtonText(zhButtonPattern('Add group')))
  const added = await evaluate(`(() => {
    const input = ${NAME_INPUT};
    return {
      value: input?.value ?? null,
      focused: input === document.activeElement,
      selected:
        input !== null &&
        input.selectionStart === 0 &&
        input.selectionEnd === input.value.length,
    };
  })()`)
  check(
    added.value === 'group_1' && added.focused && added.selected,
    'adding a group opens the sheet with a free name selected',
    JSON.stringify(added)
  )
  const newGroup = '新增分组'
  await retype(NAME_INPUT, newGroup)
  await click(`${NAME_COMMIT}`)
  const withNewGroup = await readCardNames()
  check(
    withNewGroup.length === 8 && withNewGroup.at(-1) === newGroup,
    'committing the name appends the new group as the last card',
    withNewGroup.join(' → ')
  )
  await closeSheet()
  await click(byButtonText(zhButtonPattern('Save group settings')))
  const addWrite = await until(
    () =>
      optionWrites.find(
        (write) =>
          write.key === 'GroupRatio' &&
          JSON.parse(write.value)[newGroup] !== undefined
      ),
    'GroupRatio write with the new group',
    10000
  )
  check(
    Object.keys(JSON.parse(addWrite.value)).at(-1) === newGroup,
    'saving writes the new group last',
    Object.keys(JSON.parse(addWrite.value)).join(' → ')
  )

  // ---- The detail sheet renames a group, and the card order keeps it ----
  await navigate(GROUP_PRICING_ROUTE, LIST)
  await click(buttonLabelled(cardNamed('福利分组'), zhLabel('Details')))
  const renamed = '福利分组改'
  await retype(NAME_INPUT, renamed)
  await click(byButtonText(zhButtonPattern('Rename')))
  const afterRename = await readCardNames()
  check(
    afterRename[0] === renamed && !afterRename.includes('福利分组'),
    'renaming in the detail sheet renames the card',
    afterRename.join(' → ')
  )

  // 详情面板是模态的：不关掉它，后面的点击全落在遮罩上，等于没点。
  await closeSheet()
  await click(byButtonText(zhButtonPattern('Save group settings')))
  const renameWrite = await until(
    () =>
      optionWrites
        .filter((write) => write.key === 'GroupRatio')
        .find((write) => JSON.parse(write.value)[renamed] !== undefined),
    'renamed GroupRatio write',
    10000
  )
  check(
    Object.keys(JSON.parse(renameWrite.value))[0] === renamed,
    'saving writes the renamed key in the same position',
    Object.keys(JSON.parse(renameWrite.value)).join(' → ')
  )

  // ---- 重名必须当场拦下：卡片顺序和保存都以名字为准，两个同名分组没有意义 ----
  await navigate(GROUP_PRICING_ROUTE, LIST)
  const writesBeforeDuplicate = optionWrites.length
  await click(buttonLabelled(cardNamed('Pro 20x分组'), zhLabel('Details')))
  await retype(NAME_INPUT, '福利分组')
  const duplicate = await evaluate(`(() => {
    const input = ${NAME_INPUT};
    const button = ${NAME_COMMIT};
    return {
      invalid: input?.getAttribute('aria-invalid'),
      hint: document.body.innerText.includes(${JSON.stringify(zhLabel('This group name is already in use.'))}),
      disabled: button ? button.disabled : null,
      label: (button?.textContent || '').trim(),
      draft: input?.value,
    };
  })()`)
  check(
    duplicate.invalid === 'true' &&
      duplicate.hint &&
      duplicate.disabled === true &&
      duplicate.label === zhLabel('Rename'),
    'a name another group already uses is refused in place',
    JSON.stringify(duplicate)
  )
  await closeSheet()
  await click(byButtonText(zhButtonPattern('Save group settings')))
  // 什么都没改时保存不一定发请求，所以两条都收：要么没写，要么写下来的仍是原来那
  // 七个名字——总之这个重名不许落盘。
  await pause(1500)
  const keptWrites = optionWrites
    .slice(writesBeforeDuplicate)
    .filter((write) => write.key === 'GroupRatio')
  const keptNames = await readCardNames()
  const spoiledWrite = keptWrites.find((write) => {
    const keys = Object.keys(JSON.parse(write.value))
    return (
      keys.length !== 7 ||
      !keys.includes('福利分组') ||
      !keys.includes('Pro 20x分组')
    )
  })
  check(
    spoiledWrite === undefined &&
      keptNames.length === 7 &&
      keptNames.includes('福利分组') &&
      keptNames.includes('Pro 20x分组'),
    'the refused name never reaches the saved settings',
    `writes=${keptWrites.length} ${keptNames.join(' → ')}`
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

  // ---- Mobile: the cards must stack without overflowing ----
  await viewport(390, 844, true)
  await navigate(GROUP_PRICING_ROUTE, LIST)
  const mobile = await evaluate(`(() => {
    const cards = ${cards};
    const overflow = cards
      .map(card => Math.round(card.getBoundingClientRect().right))
      .filter(right => right > innerWidth + 1);
    return {
      pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      cardsPastViewport: overflow.length,
      firstRowFields: (() => {
        const card = cards[0];
        const ratio = card.querySelector('input[aria-label="' + ${JSON.stringify(zhLabel('Ratio'))} + '"]');
        const description = card.querySelector('input[aria-label="' + ${JSON.stringify(zhLabel('Group description'))} + '"]');
        if (!ratio || !description) return null;
        return {
          sameRow: Math.abs(ratio.getBoundingClientRect().top - description.getBoundingClientRect().top) < 2,
          ratioLeft: Math.round(ratio.getBoundingClientRect().left),
          descriptionLeft: Math.round(description.getBoundingClientRect().left),
        };
      })(),
    };
  })()`)
  check(
    !mobile.pageOverflow && mobile.cardsPastViewport === 0,
    'no horizontal overflow at 390px',
    JSON.stringify(mobile)
  )
  check(
    mobile.firstRowFields !== null && !mobile.firstRowFields.sameRow,
    'the four fields stack onto separate lines on a phone',
    JSON.stringify(mobile.firstRowFields)
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
