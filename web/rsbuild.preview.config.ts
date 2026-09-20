/**
 * 只用于钱包卡片预览的构建配置：复用主配置（Tailwind / 别名 / 分包），
 * 只把入口、HTML 模板和输出目录换掉，产物落在 preview-dist/。
 */
import { defineConfig } from '@rsbuild/core'

import base from './rsbuild.config'

type AnyConfig = Record<string, unknown>
type BaseExport = AnyConfig | ((env: never) => AnyConfig)

export default defineConfig((env) => {
  const resolved =
    typeof base === 'function'
      ? ((base as unknown as (e: unknown) => AnyConfig)(env) as AnyConfig)
      : (base as BaseExport as AnyConfig)

  return {
    ...resolved,
    source: {
      ...(resolved.source as AnyConfig),
      entry: { preview: './src/__preview__/wallet-card.tsx' },
    },
    html: { template: './src/__preview__/index.html' },
    output: {
      ...(resolved.output as AnyConfig),
      minify: false,
      distPath: { root: 'preview-dist' },
    },
  }
})
