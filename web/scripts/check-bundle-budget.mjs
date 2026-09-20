/**
 * 首屏体积预算门。
 *
 * 用途：把「用户打开页面要先下载多少字节」变成发布前可执行的判据，防止
 * 图标库 barrel、重量级依赖或大 chunk 再次溜进初始图。
 *
 * 运行（在 web/ 目录下，先 bun run build）：
 *   node scripts/check-bundle-budget.mjs
 *
 * 度量口径（改动前先读这三条，别用别的口径争论）：
 *   1. 只看 dist/index.html 直接引用的文件——即浏览器冷启动必须下载的初始 chunk，
 *      不含路由级异步 chunk。
 *   2. 以 **gzip 后字节**为准（用 zlib level 9 现算），不是原始体积。对国内到东京
 *      这种跨境链路，传输字节才是用户等待的原因。
 *   3. 单文件阈值看最大的一块，避免「总量没超但某一块特别大」。
 *
 * 当前实测（2026-09-20 图标按需化之后）：首屏 974 KB gzip / 3,680 KB 原始，
 * 最大单文件 493 KB gzip。历史基线：修复前为 1,976 KB gzip / 8,943 KB 原始，
 * 最大单文件 1,190 KB（一个 6.1 MB 的图标 chunk）。剩余大头是 184 个 lucide 图标
 * 与 toc 元数据（各约 195 KB / 97 KB 原始），下一阶段目标 900 KB。
 *
 * 超预算时退出码非零。改预算必须是有意识的决定，而不是顺手放宽。
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

/** 预算，单位 KB（gzip） */
const BUDGETS = {
  initialTotal: 1050,
  largestFile: 550,
}

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const distDir = join(root, 'dist')
const htmlPath = join(distDir, 'index.html')

const kb = (bytes) => bytes / 1024
const fmt = (bytes) => `${kb(bytes).toFixed(1)} KB`

if (!existsSync(htmlPath)) {
  console.error(`找不到 ${htmlPath}，请先运行 bun run build`)
  process.exit(1)
}

const html = readFileSync(htmlPath, 'utf8')
const referenced = [
  ...new Set(
    [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))[^"]*"/g)].map(
      (match) => match[1]
    )
  ),
].filter((url) => !url.startsWith('http'))

const entries = []
for (const url of referenced) {
  const filePath = join(distDir, url.replace(/^\//, ''))
  if (!existsSync(filePath)) {
    console.error(`index.html 引用了不存在的文件：${url}`)
    process.exit(1)
  }
  const raw = readFileSync(filePath)
  entries.push({
    url,
    raw: raw.length,
    gzip: gzipSync(raw, { level: 9 }).length,
  })
}

if (entries.length === 0) {
  console.error('index.html 里没有解析到任何 js/css 引用，口径可能已失效')
  process.exit(1)
}

entries.sort((a, b) => b.gzip - a.gzip)

const totalGzip = entries.reduce((sum, entry) => sum + entry.gzip, 0)
const totalRaw = entries.reduce((sum, entry) => sum + entry.raw, 0)
const largest = entries[0]

console.log('TokenMetro 首屏体积预算')
console.log('-'.repeat(72))
for (const entry of entries) {
  console.log(
    `${fmt(entry.gzip).padStart(10)} gz  ${fmt(entry.raw).padStart(11)} raw  ${entry.url}`
  )
}
console.log('-'.repeat(72))

const failures = []
const report = (label, value, budget) => {
  const ok = value <= budget * 1024
  console.log(
    `${ok ? '通过' : '超限'}  ${label}：${fmt(value)}（预算 ${budget} KB gzip）`
  )
  if (!ok) failures.push({ label, value, budget })
}

report('首屏合计', totalGzip, BUDGETS.initialTotal)
report(`最大单文件 ${largest.url}`, largest.gzip, BUDGETS.largestFile)

if (failures.length > 0) {
  console.error('')
  for (const failure of failures) {
    console.error(
      `超出 ${failure.label} 预算 ${fmt(failure.value - failure.budget * 1024)}`
    )
  }
  console.error(
    '若这是有意的体积增长，请一并说明原因并调整 BUDGETS，而不是绕过这道门。'
  )
  process.exit(1)
}

console.log('')
console.log(`首屏合计 ${fmt(totalGzip)} gzip / ${fmt(totalRaw)} 原始，预算内。`)
