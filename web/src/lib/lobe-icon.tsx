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
 * LobeHub Icon Loader
 * Dynamically load and render icons from @lobehub/icons
 *
 * Supports:
 * - Basic: "OpenAI", "OpenAI.Color"
 * - Chained properties: "OpenAI.Avatar.type={'platform'}"
 * - Size parameter: getLobeIcon("OpenAI", 20)
 *
 * ⚠️ 首屏约束（2026-09-20）：**不要从 '@lobehub/icons' 根入口导入本模块所需的图标。**
 * 根入口 `export * from './features'`，而 features barrel 会静态引进全部 300+ 个图标；
 * 图标的 Avatar/Combine 子组件又依赖 @lobehub/ui 与 antd-style，会把 antd 一并拖进初始图。
 * 实测该写法使入口 chunk 达到 6.1 MB（未压缩）/ 1.2 MB（gzip），首屏白屏数秒。
 *
 * 现行策略（2026-09-20 起）：
 * - 图标名一律走 loadVariant 的**按需加载**，只取 components/<Variant>.js 子模块
 *   （仅依赖 react 与包内常量，不进 @lobehub/ui）。名字来自数据库，无法静态枚举，
 *   因此这里保留动态路径。不要为了方便改回静态导入或根入口。
 * - 加载完成前渲染与「未找到」一致的首字母圆标，尺寸不变以免布局跳动。
 * - 名字清单 getLobeIconNames 只读 toc 元数据（约 97 KB JSON），不带任何图标组件。
 * - 首屏体积由 scripts/check-bundle-budget.mjs 把关。
 */
import { toc } from '@lobehub/icons/es/toc'
import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react'

import sglangLogo from '@/assets/brand-icons/sglang.svg'
import { IconSub2api } from '@/assets/custom/icon-sub2api'
import { IconWan } from '@/assets/custom/icon-wan'

type IconComponent = ComponentType<Record<string, unknown>>
type IconProps = Record<string, string | number | boolean>

/** 仅做类型收窄，图标组件的 props 形状由调用点决定 */
const asIcon = (component: unknown): IconComponent => component as IconComponent

const CUSTOM_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  SGLang: (props) => (
    <img
      src={sglangLogo}
      alt=''
      aria-hidden='true'
      width={props.size ?? 20}
      height={props.size ?? 20}
      className='object-contain'
    />
  ),
  Sub2API: IconSub2api,
  Wan: IconWan,
}

/** @lobehub/icons 里可用的图标变体（每变体一个 components/<Variant>.js） */
const ICON_VARIANTS = ['Mono', 'Color', 'Text', 'Avatar', 'Combine'] as const
type IconVariant = (typeof ICON_VARIANTS)[number]

/** 已解析完成的图标变体缓存 */
const variantCache = new Map<string, IconComponent | null>()
/** 进行中的加载，避免同一变体重复请求 */
const variantInflight = new Map<string, Promise<IconComponent | null>>()

/**
 * 取单个变体组件模块。
 *
 * 只导入 components/<Variant>.js 而不是目录的复合入口 index.js：复合入口会把
 * Avatar/Combine 一并纳入模块图，而它们依赖 @lobehub/ui 与 antd-style，
 * 使 chunk 变大、加载变慢（实测复合入口在测试环境需约 10 秒）。
 * Mono/Color/Text 仅依赖 react 与包内常量。
 *
 * webpackInclude 把动态上下文限制在一层图标目录的 components 子目录内。缺了它会退化成
 * es/** 全扫，连带 es/components（Editor 依赖未安装的 svgo-browser）导致构建失败。
 */
async function importVariant(
  baseKey: string,
  variant: IconVariant
): Promise<IconComponent | null> {
  try {
    const mod = await import(
      /* webpackInclude: /^\.\/[A-Za-z0-9]+\/components\/(Mono|Color|Text|Avatar|Combine)\.js$/ */
      `@lobehub/icons/es/${baseKey}/components/${variant}.js`
    )
    return asIcon((mod as { default?: unknown }).default ?? mod)
  } catch {
    return null
  }
}

/**
 * 按需加载图标变体，带缓存与并发去重。
 * 该图标没有所请求的变体（例如 Groq 没有 Color）时回落到 Mono，
 * 与改动前「复合图标上取不到该键就落到 Mono」的行为一致。
 */
function loadVariant(
  baseKey: string,
  variant: IconVariant
): Promise<IconComponent | null> {
  const key = `${baseKey}.${variant}`
  const cached = variantCache.get(key)
  if (cached !== undefined) return Promise.resolve(cached)

  const inflight = variantInflight.get(key)
  if (inflight) return inflight

  const resolve = async (): Promise<IconComponent | null> => {
    let component = await importVariant(baseKey, variant)
    if (!component && variant !== 'Mono') {
      component = await loadVariant(baseKey, 'Mono')
    }
    variantCache.set(key, component)
    variantInflight.delete(key)
    return component
  }

  const request = resolve()
  variantInflight.set(key, request)
  return request
}

/**
 * Parse a property value from string to appropriate type
 * @param raw - Raw string value
 * @returns Parsed value (boolean, number, or string)
 */
function parseValue(raw: string | undefined | null): string | number | boolean {
  if (raw == null) return true

  let v = String(raw).trim()

  // Remove curly braces
  if (v.startsWith('{') && v.endsWith('}')) {
    v = v.slice(1, -1).trim()
  }

  // Remove quotes
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1)
  }

  // Boolean
  if (v === 'true') return true
  if (v === 'false') return false

  // Number
  if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v)

  // Return as string
  return v
}

/**
 * 解析链式属性（如 "type={'platform'}", "shape='square'"）。
 * 尺寸只在调用串未显式指定 size 时补齐。
 */
function parseProps(
  segments: string[],
  propStartIndex: number,
  size: number
): IconProps {
  const props: IconProps = {}

  for (let i = propStartIndex; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg) continue

    const eqIdx = seg.indexOf('=')
    if (eqIdx === -1) {
      props[seg.trim()] = true
      continue
    }

    const key = seg.slice(0, eqIdx).trim()
    const valRaw = seg.slice(eqIdx + 1).trim()
    props[key] = parseValue(valRaw)
  }

  if (props.size == null && size != null) {
    props.size = size
  }

  return props
}

/**
 * 解析图标名要用的变体与属性起始位置，复刻改动前的规则：
 * 二级键命中已知变体（Color/Text/Avatar/Combine）则取该变体并跳过后面的属性段；
 * 否则回落到 Mono，且当二级键形如变体名（大写开头）时同样跳过它。
 */
function resolveVariant(segments: string[]): {
  variant: IconVariant
  propStartIndex: number
} {
  if (segments.length === 1) {
    return { variant: 'Mono', propStartIndex: 1 }
  }

  const variantKey = segments[1]
  if ((ICON_VARIANTS as readonly string[]).includes(variantKey)) {
    return { variant: variantKey as IconVariant, propStartIndex: 2 }
  }

  return {
    variant: 'Mono',
    propStartIndex: /^[A-Z]/.test(variantKey) ? 2 : 1,
  }
}

/**
 * 兜底圆标。刻意写成返回 JSX 的普通函数而非组件：本文件同时导出非组件的
 * getLobeIcon/getLobeIconNames，声明组件会触发 react(only-export-components)。
 */
function renderFallback(size: number, label?: string): ReactNode {
  return (
    <div
      className='bg-muted text-muted-foreground flex items-center justify-center rounded-full text-xs font-medium'
      style={{ width: size, height: size }}
    >
      {label ?? '?'}
    </div>
  )
}

/** 变体加载失败（名字不存在等）时渲染的兜底组件 */
function makeFallbackIcon(label: string) {
  return (props: { size?: number }) => renderFallback(props.size ?? 20, label)
}

const lazyIconCache = new Map<string, LazyExoticComponent<IconComponent>>()

/**
 * 把某个图标名映射成可渲染的组件。
 * 用 React.lazy 而非自建 hooks 组件：本文件不需要声明组件，Suspense 负责占位，
 * 且组件身份按名字缓存，重渲染不会重新加载或重挂载。
 */
function lazyIcon(name: string): LazyExoticComponent<IconComponent> {
  const cached = lazyIconCache.get(name)
  if (cached) return cached

  const segments = name.split('.')
  const label = name.charAt(0).toUpperCase()
  const load = async () => ({
    default:
      (await loadVariant(segments[0], resolveVariant(segments).variant)) ??
      makeFallbackIcon(label),
  })

  const created = lazy(load)
  lazyIconCache.set(name, created)
  return created
}

/**
 * Get LobeHub icon component by name
 * @param iconName - Icon name/description (e.g., "OpenAI", "OpenAI.Color", "Claude.Avatar")
 * @param size - Icon size (default: 20)
 * @returns Icon component or fallback
 *
 * @example
 * getLobeIcon("OpenAI", 24)
 * getLobeIcon("OpenAI.Color", 20)
 * getLobeIcon("Claude.Avatar.type={'platform'}", 32)
 */
export function getLobeIcon(
  iconName: string | undefined | null,
  size: number = 20
): ReactNode {
  if (!iconName || typeof iconName !== 'string') {
    return renderFallback(size)
  }

  const trimmedName = iconName.trim()
  if (!trimmedName) {
    return renderFallback(size)
  }

  const segments = trimmedName.split('.')
  const baseKey = segments[0]

  const CustomIcon = CUSTOM_ICONS[baseKey]
  if (CustomIcon) {
    return <CustomIcon size={size} />
  }

  const LazyIcon = lazyIcon(trimmedName)
  return (
    <Suspense
      fallback={renderFallback(size, trimmedName.charAt(0).toUpperCase())}
    >
      <LazyIcon
        {...parseProps(segments, resolveVariant(segments).propStartIndex, size)}
      />
    </Suspense>
  )
}

// The selector uses the same installed icon registry as the renderer.
export function getLobeIconNames(): string[] {
  const names = toc.flatMap((icon) =>
    icon.param.hasColor ? [icon.id, `${icon.id}.Color`] : [icon.id]
  )
  return [...new Set([...names, ...Object.keys(CUSTOM_ICONS)])].sort()
}
