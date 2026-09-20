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
 * 生成后台图标选择器的候选名单（src/lib/lobe-icon-names.json）。
 *
 * 名单来自 @lobehub/icons 自己的 toc 元数据，只取「图标名 + 是否有 Color 变体」，
 * 因此产物是纯数据、不含任何图标组件。首屏只需要名字，不需要元数据全文——直接
 * import 包的 toc 会把约 97 KB 的元数据带进初始 chunk。
 *
 * 由 `bun run build` / `build:check` 在构建前自动重跑，所以不会与已安装的包版本
 * 脱节；产物入库，好让升级依赖带来的名单变化出现在 diff 里。
 *
 * 运行：node scripts/gen-lobe-icon-names.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const tocPath = path.join(here, '../node_modules/@lobehub/icons/es/toc.json')
const outputPath = path.join(here, '../src/lib/lobe-icon-names.json')

const icons = JSON.parse(readFileSync(tocPath, 'utf8'))

const names = [
  ...new Set(
    icons.flatMap((icon) =>
      icon.param.hasColor ? [icon.id, `${icon.id}.Color`] : [icon.id]
    )
  ),
].sort()

writeFileSync(outputPath, `${JSON.stringify(names, null, 2)}\n`)

console.log(
  `lobe-icon-names.json: ${names.length} 个名字（来自 ${icons.length} 个图标）`
)
