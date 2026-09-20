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
import type { ComponentType } from 'react'

type IconComponent = ComponentType<Record<string, unknown>>

/**
 * 动态导入一个图标变体模块；该图标没有这个变体时解析为 null。
 *
 * **本模块单独存在是有意的**：下面那条动态导入会生成一张「图标名 → chunk」的映射表
 * （实测 1480 个键，约 +100 KB 原始 / +34 KB gzip）。表只有真要画图标时才用得上，
 * 所以它必须待在自己的异步 chunk 里——放在 `lobe-icon.tsx` 里会把表推进首屏入口 chunk，
 * 把首屏从 965 KB 顶到 998 KB（预算 1000）。改动前请先跑 `bun run bundle:check`。
 *
 * 只导入 `components/<Variant>.js` 而不是目录的复合入口 `index.js`：复合入口会把
 * Avatar/Combine 一并纳入模块图，而它们依赖 `@lobehub/ui` 与 `antd-style`，
 * 使 chunk 变大、加载变慢（实测复合入口在测试环境需约 10 秒）。
 * Mono/Color/Text 仅依赖 react 与包内常量。
 *
 * `webpackInclude` 把动态上下文限制在图标的 components 子目录内。
 * **这条正则不要加 `^\.\/` 锚**：锚在键前缀上时，一旦打包器给出的键前缀与假设不符，
 * 就会静默匹配到 0 个模块——上下文变空、每个图标 import 直接失败、全部退化成字母兜底，
 * 而构建照样成功，比构建失败难发现得多（2026-09-21 线上正是栽在这里）。
 * 现在只认路径尾部 `<名>/components/<变体>.js`，因此对键前缀不敏感。
 * 它同时天然排除掉包内那 5 个同名但非图标的文件（`components/Editor/{Mono,Color,Text}.js`、
 * `components/Dashboard/Text.js`、`features/ProviderCombine/Combine.js`），
 * 也就避开了 Editor 依赖未安装的 `svgo-browser` 那条路。
 */
export async function importIconVariant(
  baseKey: string,
  variant: string
): Promise<IconComponent | null> {
  try {
    const mod = await import(
      /* webpackInclude: /[A-Za-z0-9]+\/components\/(Mono|Color|Text|Avatar|Combine)\.js$/ */
      `@lobehub/icons/es/${baseKey}/components/${variant}.js`
    )
    // 组件可能在 default 上，也可能就是模块命名空间本身
    return ((mod as { default?: unknown }).default ?? mod) as IconComponent
  } catch {
    return null
  }
}
