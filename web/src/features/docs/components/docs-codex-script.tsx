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
import {
  CheckCircle2,
  Cpu,
  FileCode2,
  Globe2,
  KeyRound,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SCRIPT_RAW_URL =
  'https://raw.githubusercontent.com/tionmon/vpsh/refs/heads/main/run/incodex.sh'

export function DocsCodexScript() {
  const { t } = useTranslation()

  // Default to current location origin in browser
  const defaultUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://api.your-domain.com'

  const [gatewayUrl, setGatewayUrl] = useState(defaultUrl)
  const [apiKey, setApiKey] = useState('')
  const [useCnMirror, setUseCnMirror] = useState(false)
  const [testOnly, setTestOnly] = useState(false)

  // Construct command
  const cleanUrl = gatewayUrl.trim().replace(/\/+$/, '') || defaultUrl
  const effectiveKey = apiKey.trim() || 'sk-your-api-key-here'

  let generatedCommand = `curl -fsSL ${SCRIPT_RAW_URL} | bash -s --`
  if (useCnMirror) {
    generatedCommand += ' --mirror cn'
  }
  if (testOnly) {
    generatedCommand += ' --test-only'
  }
  generatedCommand += ` --url ${cleanUrl} --key ${effectiveKey}`

  return (
    <div className='space-y-10'>
      {/* Header section */}
      <div>
        <div className='mb-3 flex flex-wrap items-center gap-2'>
          <Badge
            variant='outline'
            className='bg-foreground/5 text-foreground font-mono text-xs'
          >
            v1.0.0
          </Badge>
          <Badge className='bg-foreground text-background text-xs font-medium'>
            ⭐ {t('Recommended')}
          </Badge>
          <Badge
            variant='outline'
            className='border-emerald-500/40 text-xs text-emerald-600 dark:text-emerald-400'
          >
            {t('Zero-Config Auto-Deploy')}
          </Badge>
        </div>
        <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
          {t('Codex CLI One-Click Setup Script')}
        </h1>
        <p className='text-muted-foreground mt-2 text-sm leading-relaxed md:text-base'>
          {t(
            'Automated configuration script for developers. Performs Node.js LTS runtime check, global Codex CLI deployment, gateway Base URL and API Key persistence, and end-to-end connectivity testing.'
          )}
        </p>
      </div>

      {/* Interactive Command Builder */}
      <div className='border-border/80 bg-card/60 overflow-hidden rounded-xl border shadow-xs backdrop-blur-sm'>
        <div className='border-border/60 bg-muted/30 flex items-center justify-between border-b px-5 py-3.5'>
          <div className='flex items-center gap-2'>
            <Terminal className='text-foreground size-4' />
            <span className='text-foreground text-sm font-semibold'>
              {t('Interactive One-Click Command Generator')}
            </span>
          </div>
          <span className='text-muted-foreground hidden text-xs sm:inline'>
            {t('Real-time parameter generation')}
          </span>
        </div>

        <div className='space-y-6 p-5 md:p-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Base URL input */}
            <div className='space-y-1.5'>
              <Label className='text-foreground flex items-center gap-1.5 text-xs font-medium'>
                <Globe2 className='text-muted-foreground size-3.5' />
                {t('Gateway Base URL')}
              </Label>
              <Input
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder='https://api.your-domain.com'
                className='bg-background/80 h-9 font-mono text-xs'
              />
              <p className='text-muted-foreground text-[11px]'>
                {t(
                  'Defaults to current site domain, script normalizes trailing slashes automatically'
                )}
              </p>
            </div>

            {/* API Key input */}
            <div className='space-y-1.5'>
              <Label className='text-foreground flex items-center gap-1.5 text-xs font-medium'>
                <KeyRound className='text-muted-foreground size-3.5' />
                {t('API Key (Bearer Token)')}
              </Label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder='sk-...'
                type='password'
                className='bg-background/80 h-9 font-mono text-xs'
              />
              <p className='text-muted-foreground text-[11px]'>
                {t(
                  'Create in Tokens console, placeholder will be used if omitted'
                )}
              </p>
            </div>
          </div>

          {/* Options toggles */}
          <div className='flex flex-wrap items-center gap-4 pt-1'>
            <label className='flex cursor-pointer items-center gap-2 text-xs select-none'>
              <input
                type='checkbox'
                checked={useCnMirror}
                onChange={(e) => setUseCnMirror(e.target.checked)}
                className='border-border accent-foreground size-3.5 rounded'
              />
              <span className='text-foreground font-medium'>
                {t('China Mainland Mirror Acceleration (--mirror cn)')}
              </span>
              <span className='text-muted-foreground text-[11px]'>
                ({t('Use npmmirror for ultra-fast downloads')})
              </span>
            </label>

            <label className='flex cursor-pointer items-center gap-2 text-xs select-none'>
              <input
                type='checkbox'
                checked={testOnly}
                onChange={(e) => setTestOnly(e.target.checked)}
                className='border-border accent-foreground size-3.5 rounded'
              />
              <span className='text-foreground font-medium'>
                {t('Test connectivity only (--test-only)')}
              </span>
            </label>
          </div>

          {/* Generated Command Box */}
          <div className='border-border relative overflow-x-auto rounded-lg border bg-neutral-950 p-4 font-mono text-xs text-neutral-100 shadow-inner'>
            <div className='mb-2 flex items-center justify-between border-b border-neutral-800/80 pb-2 text-[11px] text-neutral-400'>
              <div className='flex items-center gap-2'>
                <span className='inline-block size-2.5 rounded-full bg-emerald-500' />
                <span>Bash / Zsh / Linux / macOS</span>
              </div>
              <CopyButton
                value={generatedCommand}
                variant='ghost'
                size='sm'
                className='h-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              />
            </div>
            <code className='block leading-relaxed break-all whitespace-pre-wrap text-emerald-400 select-all dark:text-emerald-300'>
              {generatedCommand}
            </code>
          </div>
        </div>
      </div>

      {/* Script Execution Pipeline */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Zap className='text-foreground size-4' />
          <h2 className='text-foreground text-lg font-semibold'>
            {t('Full Script Execution Pipeline')}
          </h2>
        </div>
        <p className='text-muted-foreground text-xs'>
          {t(
            'Includes robust fault-tolerance and SHA-256 integrity verification with zero manual intervention.'
          )}
        </p>

        <div className='grid grid-cols-1 gap-3.5 pt-2 md:grid-cols-3'>
          <div className='border-border/80 bg-card/40 space-y-2 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground font-mono text-xs font-bold'>
                01
              </span>
              <Cpu className='text-muted-foreground size-4' />
            </div>
            <h3 className='text-foreground text-sm font-semibold'>
              {t('Node.js Runtime Detection & Install')}
            </h3>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              {t(
                'Verifies Node.js >= 18; if missing, downloads LTS package with SHA-256 validation to ~/.local/lib/nodejs without root.'
              )}
            </p>
          </div>

          <div className='border-border/80 bg-card/40 space-y-2 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground font-mono text-xs font-bold'>
                02
              </span>
              <Terminal className='text-muted-foreground size-4' />
            </div>
            <h3 className='text-foreground text-sm font-semibold'>
              {t('Codex CLI Deployment & Config')}
            </h3>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              {t(
                'Installs @openai/codex globally and generates ~/.codex/config.toml with current gateway endpoint.'
              )}
            </p>
          </div>

          <div className='border-border/80 bg-card/40 space-y-2 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground font-mono text-xs font-bold'>
                03
              </span>
              <ShieldCheck className='text-muted-foreground size-4' />
            </div>
            <h3 className='text-foreground text-sm font-semibold'>
              {t('Environment Persistence & Self-Check')}
            </h3>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              {t(
                'Detects Bash, Zsh, or Fish config to persist OPENAI_BASE_URL and CODEX_API_KEY, verifying API reachability.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* CLI Parameter Matrix */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <FileCode2 className='text-foreground size-4' />
          <h2 className='text-foreground text-lg font-semibold'>
            {t('CLI Parameter Matrix & Options')}
          </h2>
        </div>

        <div className='border-border/80 overflow-x-auto rounded-lg border'>
          <table className='w-full text-left text-xs'>
            <thead className='border-border/80 bg-muted/40 text-foreground border-b font-medium'>
              <tr>
                <th className='px-4 py-2.5'>{t('Parameter')}</th>
                <th className='px-4 py-2.5'>{t('Type')}</th>
                <th className='px-4 py-2.5'>{t('Default')}</th>
                <th className='px-4 py-2.5'>{t('Description')}</th>
              </tr>
            </thead>
            <tbody className='divide-border/60 text-muted-foreground divide-y'>
              <tr>
                <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
                  --url &lt;URL&gt;
                </td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>string</td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>
                  交互式输入
                </td>
                <td className='px-4 py-2.5'>
                  {t('API Gateway Base URL (auto trims trailing slashes)')}
                </td>
              </tr>
              <tr>
                <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
                  --key &lt;KEY&gt;
                </td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>string</td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>
                  交互式输入
                </td>
                <td className='px-4 py-2.5'>
                  {t('API Key token (supports sk- format and system tokens)')}
                </td>
              </tr>
              <tr>
                <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
                  --mirror cn
                </td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>flag</td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>关闭</td>
                <td className='px-4 py-2.5'>
                  {t(
                    'Enable domestic acceleration: Node.js downloads via npmmirror, npm registry via registry.npmmirror.com'
                  )}
                </td>
              </tr>
              <tr>
                <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
                  --test-only
                </td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>flag</td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>false</td>
                <td className='px-4 py-2.5'>
                  {t(
                    'Runs API connection test only, without writing persistent config or installing runtimes'
                  )}
                </td>
              </tr>
              <tr>
                <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
                  --help, -h
                </td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>flag</td>
                <td className='px-4 py-2.5 font-mono text-[11px]'>-</td>
                <td className='px-4 py-2.5'>
                  {t('Show CLI help message and available options')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Setup Fallback */}
      <div className='border-border/80 bg-muted/20 space-y-3.5 rounded-xl border p-5'>
        <div className='text-foreground flex items-center gap-2 text-sm font-semibold'>
          <CheckCircle2 className='size-4 text-emerald-500' />
          {t('Manual Configuration Reference')}
        </div>
        <p className='text-muted-foreground text-xs'>
          {t(
            'In restricted environments or Windows systems, you can manually set the following environment variables:'
          )}
        </p>

        <div className='border-border relative overflow-x-auto rounded-lg border bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200'>
          <div className='absolute top-2 right-2'>
            <CopyButton
              value={`export OPENAI_BASE_URL="${cleanUrl}/v1"\nexport OPENAI_API_KEY="${effectiveKey}"\nexport CODEX_API_KEY="${effectiveKey}"`}
              variant='ghost'
              size='sm'
              className='h-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
            />
          </div>
          <pre className='text-emerald-400'>
            {`export OPENAI_BASE_URL="${cleanUrl}/v1"
export OPENAI_API_KEY="${effectiveKey}"
export CODEX_API_KEY="${effectiveKey}"`}
          </pre>
        </div>
      </div>
    </div>
  )
}
