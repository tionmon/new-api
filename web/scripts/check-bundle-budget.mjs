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
 * 首屏体积预算门。
 *
 * 用途：把「用户打开页面要先下载多少字节」变成发布前可执行的判据，防止
 * 图标库 barrel、重量级依赖或大 chunk 再次溜进初始图。
 *
 * 运行（在 web/ 目录下，先 bun run build）：
 *   node scripts/check-bundle-budget.mjs [dist 目录]
 * 第二个参数可指向别的产物目录，默认取脚本同级的 ../dist。
 *
 * 度量口径（改动前先读这三条，别用别的口径争论）：
 *   1. 只看 dist/index.html 直接引用的文件——即浏览器冷启动必须下载的初始 chunk，
 *      不含路由级异步 chunk。
 *   2. 以 **gzip 后字节**为准（用 zlib level 9 现算），不是原始体积。对国内到东京
 *      这种跨境链路，传输字节才是用户等待的原因。
 *   3. 单文件阈值看最大的一块，避免「总量没超但某一块特别大」。
 *
 * 当前实测（2026-09-20 图标按需化 + 名字清单外部化之后）：首屏 964.7 KB gzip /
 * 3,589 KB 原始，最大单文件 495.4 KB gzip。历史基线：修复前为 1,976 KB gzip /
 * 8,943 KB 原始，最大单文件 1,190 KB（一个 6.1 MB 的图标 chunk）。剩余大头是
 * web/src/lib/ 之外的 lucide 图标（约 183 KB gzip）与业务代码本身（约 495 KB gzip），
 * 下一阶段目标 900 KB（本轮未达成，见 Plans/Spec-TokenMetro-前端首屏性能修复.md）。
 *
 * 超预算时退出码非零。改预算必须是有意识的决定，而不是顺手放宽。
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

/** 预算，单位 KB（gzip） */
export const BUDGETS = {
  initialTotal: 1000,
  largestFile: 520,
}

const rule = '-'.repeat(72)

/** 输出与判据统一用 gzip 后的 KB */
const fmt = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

/** 从产物 index.html 取出初始 chunk 的地址，按首次出现去重 */
export function parseInitialChunkUrls(html) {
  return [
    ...new Set(
      [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))[^"]*"/g)].map(
        (match) => match[1]
      )
    ),
  ].filter((url) => !url.startsWith('http'))
}

/** 量每个地址的体积，按 gzip 从大到小排列（第一个即最大单文件） */
export function measureChunks(distDir, urls) {
  return urls
    .map((url) => {
      const filePath = join(distDir, url.replace(/^\//, ''))
      if (!existsSync(filePath)) {
        return { url, missing: true, raw: 0, gzip: 0 }
      }
      const raw = readFileSync(filePath)
      return {
        url,
        missing: false,
        raw: raw.length,
        gzip: gzipSync(raw, { level: 9 }).length,
      }
    })
    .sort((a, b) => b.gzip - a.gzip)
}

/** 两条判据各自是否超限，供 CLI 打印、也供测试直接断言 */
export function evaluateBudgets(entries, budgets) {
  if (entries.length === 0) return []

  const totalGzip = entries.reduce((sum, entry) => sum + entry.gzip, 0)
  const verdicts = [
    { label: '首屏合计', value: totalGzip, budgetKb: budgets.initialTotal },
    {
      label: `最大单文件 ${entries[0].url}`,
      value: entries[0].gzip,
      budgetKb: budgets.largestFile,
    },
  ]
  return verdicts.map((verdict) => ({
    ...verdict,
    limit: verdict.budgetKb * 1024,
    ok: verdict.value <= verdict.budgetKb * 1024,
  }))
}

function main(argument) {
  const distDir =
    argument ?? join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist')
  const htmlPath = join(distDir, 'index.html')

  const fail = (message) => {
    console.error(message)
    process.exit(1)
  }

  if (!existsSync(htmlPath)) {
    fail(`找不到 ${htmlPath}，请先运行 bun run build`)
  }

  const referenced = parseInitialChunkUrls(readFileSync(htmlPath, 'utf8'))
  if (referenced.length === 0) {
    fail('index.html 里没有解析到任何 js/css 引用，口径可能已失效')
  }

  const entries = measureChunks(distDir, referenced)
  const missing = entries.find((entry) => entry.missing)
  if (missing) {
    fail(`index.html 引用了不存在的文件：${missing.url}`)
  }

  const totalGzip = entries.reduce((sum, entry) => sum + entry.gzip, 0)
  const totalRaw = entries.reduce((sum, entry) => sum + entry.raw, 0)

  console.log('TokenMetro 首屏体积预算')
  console.log(rule)
  for (const entry of entries) {
    console.log(
      `${fmt(entry.gzip).padStart(10)} gz  ${fmt(entry.raw).padStart(11)} raw  ${entry.url}`
    )
  }
  console.log(rule)

  const verdicts = evaluateBudgets(entries, BUDGETS)
  for (const verdict of verdicts) {
    console.log(
      `${verdict.ok ? '通过' : '超限'}  ${verdict.label}：${fmt(verdict.value)}` +
        `（预算 ${verdict.budgetKb} KB gzip）`
    )
  }

  const failures = verdicts.filter((verdict) => !verdict.ok)
  if (failures.length > 0) {
    console.error('')
    for (const failure of failures) {
      console.error(
        `超出 ${failure.label} 预算 ${fmt(failure.value - failure.limit)}`
      )
    }
    fail(
      '若这是有意的体积增长，请一并说明原因并调整 BUDGETS，而不是绕过这道门。'
    )
  }

  console.log('')
  console.log(
    `首屏合计 ${fmt(totalGzip)} gzip / ${fmt(totalRaw)} 原始，预算内。`
  )
}

// 测试会 import 本模块取纯函数，只有直接执行时才跑主流程。
// 用 realpath 比较：入参路径可能经过符号链接（macOS 的 /tmp 就是），
// 直接比 import.meta.url 会漏判成「被 import 了」而静默什么都不做。
function isDirectRun() {
  const entry = process.argv[1]
  if (!entry) return false
  try {
    return realpathSync(entry) === fileURLToPath(import.meta.url)
  } catch {
    return false
  }
}

if (isDirectRun()) {
  main(process.argv[2])
}
