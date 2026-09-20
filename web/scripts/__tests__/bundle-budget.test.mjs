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
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, it } from 'vitest'

import {
  evaluateBudgets,
  measureChunks,
  parseInitialChunkUrls,
} from '../check-bundle-budget.mjs'

/**
 * 这道门守着「首屏别再长出 6 MB」，所以它自己也得有人守：口径解析错了、
 * 或超限判据被改成永远通过，都会让门形同虚设而没人发现。
 */

const distWith = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'bundle-budget-'))
  mkdirSync(join(dir, 'static/js'), { recursive: true })
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content)
  }
  return dir
}

it('takes only the modules index.html loads on cold start', () => {
  // 异步 chunk 不进冷启动，但那是构建的性质（rsbuild 只把初始 chunk 写进
  // index.html），不是这个解析器的规则，所以这里不为它设断言。
  const html = [
    '<script defer src="/static/js/index.abc.js"></script>',
    '<link href="/static/css/index.def.css" rel="stylesheet">',
    '<script src="https://cdn.example.com/analytics.js"></script>',
    // 同一个文件出现两次只算一次
    '<link href="/static/js/index.abc.js" rel="preload">',
  ].join('\n')

  expect(parseInitialChunkUrls(html)).toEqual([
    '/static/js/index.abc.js',
    '/static/css/index.def.css',
  ])
})

it('measures gzip size and sorts the largest first', () => {
  const dist = distWith({
    'static/js/big.js': 'const value = 1;'.repeat(1200),
    'static/js/small.js': 'const a = 1;',
  })

  const entries = measureChunks(dist, [
    '/static/js/small.js',
    '/static/js/big.js',
  ])

  expect(entries.map((entry) => entry.url)).toEqual([
    '/static/js/big.js',
    '/static/js/small.js',
  ])
  expect(entries[0].gzip).toBeLessThan(entries[0].raw)
  expect(entries.every((entry) => entry.missing === false)).toBe(true)
})

it('flags a referenced file that is not in the build output', () => {
  const entries = measureChunks(distWith({}), ['/static/js/gone.js'])

  expect(entries[0].missing).toBe(true)
})

it('passes when both totals sit inside the budget', () => {
  const verdicts = evaluateBudgets(
    [
      { url: '/big.js', gzip: 300 * 1024, raw: 0, missing: false },
      { url: '/small.js', gzip: 100 * 1024, raw: 0, missing: false },
    ],
    { initialTotal: 500, largestFile: 320 }
  )

  expect(verdicts.every((verdict) => verdict.ok)).toBe(true)
})

it('fails the total budget and the largest-file budget independently', () => {
  const tooMuchTotal = evaluateBudgets(
    [
      { url: '/big.js', gzip: 300 * 1024, raw: 0, missing: false },
      { url: '/small.js', gzip: 300 * 1024, raw: 0, missing: false },
    ],
    { initialTotal: 500, largestFile: 320 }
  )
  expect(tooMuchTotal.map((verdict) => verdict.ok)).toEqual([false, true])

  const oneOversizedChunk = evaluateBudgets(
    [{ url: '/giant.js', gzip: 600 * 1024, raw: 0, missing: false }],
    { initialTotal: 1000, largestFile: 520 }
  )
  expect(oneOversizedChunk.map((verdict) => verdict.ok)).toEqual([true, false])
})
