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
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Pause, Play, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

interface CliProfile {
  id: string
  name: string
  tag: string
  icon: string
  command: string
  renderOutput: () => React.ReactNode
}

export function HeroCliShowcase({ className }: { className?: string }) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const cliProfiles: CliProfile[] = [
    {
      id: 'claude-code',
      name: 'Claude Code',
      tag: 'Anthropic Agent',
      icon: 'Claude.Color',
      command:
        'export ANTHROPIC_BASE_URL="https://tokenmetro.com/v1" && export ANTHROPIC_API_KEY="sk-metro-token" && claude',
      renderOutput: () => (
        <div className='space-y-3.5 text-[13.5px] leading-relaxed font-mono'>
          <div className='flex items-center justify-between text-neutral-700 dark:text-neutral-300'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-neutral-800 dark:text-neutral-200'>╭── claude-code</span>
              <span className='rounded bg-neutral-200/80 px-2 py-0.5 text-[10.5px] font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-300'>
                Agent Mode
              </span>
            </div>
            <span className='text-xs text-neutral-500 dark:text-neutral-400'>Dispatch: OpenAI Official Direct</span>
          </div>
          <div className='border-l-2 border-neutral-300 pl-4 space-y-2.5 text-neutral-700 dark:border-neutral-700/60 dark:text-neutral-300'>
            <div className='flex items-center gap-2 text-neutral-800 dark:text-neutral-200'>
              <span className='text-emerald-500 dark:text-emerald-400'>●</span>
              <span>
                Endpoint:{' '}
                <span className='font-semibold text-neutral-900 dark:text-white'>
                  https://tokenmetro.com/v1
                </span>
              </span>
            </div>
            <div className='flex items-center gap-2 text-neutral-800 dark:text-neutral-200'>
              <span className='text-emerald-500 dark:text-emerald-400'>●</span>
              <span>
                API Key Token:{' '}
                <code className='rounded bg-neutral-200/80 px-1.5 py-0.5 text-neutral-800 dark:bg-white/10 dark:text-neutral-200'>
                  sk-metro-••••••••
                </code>{' '}
                <span className='text-xs text-emerald-600 dark:text-emerald-400'>✔ Verified</span>
              </span>
            </div>
            <div className='flex items-center gap-2 text-neutral-600 dark:text-neutral-400'>
              <span className='animate-pulse text-emerald-500 dark:text-emerald-400'>◆</span>
              <span>
                Upstream Dispatch:{' '}
                <span className='font-semibold text-neutral-900 dark:text-white'>OpenAI Official Direct</span>{' '}
                (Protocol translation active)
              </span>
            </div>
            <div className='rounded-lg border border-emerald-500/30 bg-emerald-50/90 p-3 text-[12px] text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'>
              ✔ Executing Current Test Suite: 36/36 integration tests passed (100% success rate)
            </div>
            <div className='rounded-lg border border-neutral-200 bg-neutral-100/80 p-2.5 text-[12px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300'>
              <span className='font-semibold text-neutral-900 dark:text-white'>Test Suite:</span> e2e_gateway_auth_test • 0 errors • SSE streaming verified
            </div>
            <div className='flex items-center justify-between pt-1.5 text-[12px] text-neutral-600 dark:text-neutral-400 border-t border-neutral-200/70 dark:border-neutral-800/70'>
              <span>Tokens: 1,680 in / 420 out • Cache Hit: 95%</span>
              <span className='font-semibold text-emerald-600 dark:text-emerald-400'>Speed: 76.8 tok/s • Latency: 21ms</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cursor',
      name: 'Cursor',
      tag: 'AI Code Editor',
      icon: 'Cursor',
      command: 'cursor --model deepseek --stream "Implement overflow-safe quota math"',
      renderOutput: () => (
        <div className='space-y-3.5 text-[13.5px] leading-relaxed font-mono'>
          <div className='flex items-center justify-between text-neutral-700 dark:text-neutral-300'>
            <span className='font-semibold text-neutral-800 dark:text-neutral-200'>cursor • git: main*</span>
            <span className='font-mono text-xs text-neutral-500 dark:text-neutral-400'>Gateway Latency: 18ms</span>
          </div>
          <div className='space-y-2.5 text-neutral-800 dark:text-neutral-200'>
            <div className='flex items-center justify-between text-neutral-600 dark:text-neutral-400'>
              <span>
                Model: <span className='font-semibold text-neutral-900 dark:text-white'>DeepSeek</span> via Dynamic LB
              </span>
              <span className='text-[11px] text-emerald-600 dark:text-emerald-400'>HTTP/2 Active</span>
            </div>
            <div className='rounded-lg border border-neutral-200 bg-neutral-100/90 p-3 text-[12px] space-y-1.5 text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200'>
              <div className='flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-white'>
                <Sparkles className='size-3.5 animate-spin text-neutral-600 dark:text-neutral-400' />
                <span>DeepSeek Reasoning Stream &lt;think&gt;</span>
              </div>
              <p className='leading-relaxed text-neutral-600 dark:text-neutral-300'>
                To prevent arithmetic overflow during multi-currency token billing, calculate quota using
                common.QuotaRoundChecked to capture clamping metadata and guarantee safe int32 bounds...
              </p>
            </div>
            <div className='rounded-lg border border-neutral-200 bg-neutral-100/70 p-2.5 text-[12px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300'>
              <div className='text-[11px] text-neutral-500 dark:text-neutral-400'>diff --git a/common/quota_math.go b/common/quota_math.go</div>
              <div className='text-emerald-600 dark:text-emerald-400'>+ return QuotaRoundChecked(computedQuota)</div>
            </div>
            <div className='flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 pt-1'>
              <span>Commit 7386a1: feat(billing): enforce overflow-safe quota math</span>
              <span className='font-semibold'>100% Zero-Loss</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'openai-cli',
      name: 'OpenAI CLI',
      tag: 'GPT Pro 20X',
      icon: 'OpenAI',
      command:
        'export OPENAI_BASE_URL="https://api.openai.com/v1" && openai api chat.completions.create -m gpt-6-astra --stream',
      renderOutput: () => (
        <div className='space-y-3.5 text-[13.5px] leading-relaxed font-mono'>
          <div className='flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400'>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-emerald-600 dark:text-emerald-400'>HTTP/2 200 OK • SSE Stream</span>
              <span className='rounded bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400'>
                GPT Pro 20X Dedicated
              </span>
            </div>
            <div className='flex items-center gap-1 rounded bg-neutral-200/80 px-2 py-0.5 text-[10.5px] font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-300'>
              <ShieldCheck className='size-3 text-emerald-600 dark:text-emerald-400' />
              <span>Ultra-High Stability SLA 99.99%</span>
            </div>
          </div>
          <div className='space-y-2.5 text-neutral-800 dark:text-neutral-200'>
            <div className='space-y-1 text-xs text-neutral-500 dark:text-neutral-400'>
              <div className='flex items-center gap-2 text-neutral-800 dark:text-neutral-200'>
                <span className='text-emerald-500 dark:text-emerald-400'>●</span>
                <span>
                  Official Endpoint:{' '}
                  <span className='font-semibold text-neutral-900 dark:text-white'>
                    https://api.openai.com/v1
                  </span>
                </span>
              </div>
              <div>{`> data: {"id":"chatcmpl-9A","model":"gpt-6-astra","choices":[{"delta":{"content":"Architecting"}}]}`}</div>
              <div>{`> data: {"id":"chatcmpl-9A","model":"gpt-6-astra","choices":[{"delta":{"content":" rock-solid enterprise stability"}}]}`}</div>
            </div>
            <div className='rounded-lg border border-neutral-200 bg-neutral-100/70 p-3 text-[12.5px] leading-relaxed text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-900/60 dark:text-neutral-300'>
              Direct official OpenAI endpoint dispatch powered by dedicated GPT Pro 20X acceleration.
              Engineered for extreme zero-jitter stability, 20x concurrency burst endurance, and guaranteed zero-loss quota settlement.
            </div>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div className='rounded-lg border border-neutral-200 bg-neutral-100/60 p-2 dark:border-neutral-800 dark:bg-neutral-900/40'>
                <span className='text-[10px] text-neutral-500 dark:text-neutral-400'>Pipeline & Channel</span>
                <div className='font-bold text-neutral-900 dark:text-white'>OpenAI Official • GPT Pro 20X</div>
              </div>
              <div className='rounded-lg border border-neutral-200 bg-neutral-100/60 p-2 dark:border-neutral-800 dark:bg-neutral-900/40'>
                <span className='text-[10px] text-neutral-500 dark:text-neutral-400'>Stability SLA</span>
                <div className='font-bold text-emerald-600 dark:text-emerald-400'>99.99% • 0 Jitter / 0 Drops</div>
              </div>
            </div>
            <div className='flex items-center justify-between border-t border-neutral-200 pt-2 text-[11.5px] text-neutral-600 dark:border-neutral-800/80 dark:text-neutral-400'>
              <span>Model: GPT-6 Astra • 20X Burst Pool</span>
              <span className='font-semibold text-emerald-600 dark:text-emerald-400'>State: Ultra-Stable • Quota Verified</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'bench-cli',
      name: 'High-Concurrency Bench',
      tag: 'Throughput',
      icon: 'Zap',
      command: 'llm-bench -c 120 -n 1200 --gateway http://localhost:3000',
      renderOutput: () => (
        <div className='space-y-3.5 text-[13.5px] leading-relaxed font-mono'>
          <div className='flex items-center justify-between text-xs'>
            <span className='font-bold text-neutral-900 dark:text-neutral-200'>120 Concurrent Workers Active</span>
            <span className='font-semibold text-emerald-600 dark:text-emerald-400'>Success Rate: 100.0%</span>
          </div>
          <div className='grid grid-cols-2 gap-2.5 text-xs'>
            <div className='rounded-lg border border-neutral-200 bg-white p-3 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900/50'>
              <div className='text-[10px] uppercase text-neutral-500 dark:text-neutral-400'>P50 / P99 Latency</div>
              <div className='font-mono text-base font-bold text-neutral-900 dark:text-white'>11.2ms / 38ms</div>
            </div>
            <div className='rounded-lg border border-neutral-200 bg-white p-3 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900/50'>
              <div className='text-[10px] uppercase text-neutral-500 dark:text-neutral-400'>Throughput Peak</div>
              <div className='font-mono text-base font-bold text-emerald-600 dark:text-emerald-400'>742 tok/s</div>
            </div>
          </div>
          <div className='rounded-lg border border-neutral-200 bg-neutral-100/60 p-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-300'>
            <div className='flex justify-between items-center'>
              <span>Automatic Failover Triggers:</span>
              <span className='font-semibold text-emerald-600 dark:text-emerald-400'>14 / 14 (Zero 5xx seen)</span>
            </div>
          </div>
          <div className='space-y-1 pt-1 text-[12px] text-neutral-600 dark:text-neutral-400'>
            <div className='flex justify-between'>
              <span>Active Upstream Channels:</span>
              <span className='font-medium text-neutral-800 dark:text-neutral-200'>8 Providers in Load Pool</span>
            </div>
            <div className='flex justify-between'>
              <span>Memory Overhead:</span>
              <span className='font-medium text-neutral-800 dark:text-neutral-200'>24MB RSS (Go Runtime)</span>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentProfile = cliProfiles[activeIndex]

  // Lightweight auto-switch with zero intermediate progress re-renders
  useEffect(() => {
    if (prefersReduced || isManuallyPaused || isHovered) return

    const timer = setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % cliProfiles.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [isManuallyPaused, isHovered, prefersReduced, cliProfiles.length])

  const handleSelectTab = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  return (
    <div
      className={cn('relative w-full max-w-2xl xl:max-w-[700px] group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle ambient lens glow */}
      <div
        aria-hidden
        className='pointer-events-none absolute -inset-2 rounded-3xl bg-radial from-neutral-500/10 via-neutral-500/5 to-transparent opacity-60 blur-2xl transition-opacity duration-500 dark:opacity-30 dark:from-white/5'
      />

      {/* Main Terminal Frame: Light & Dark mode adaptive */}
      <div className='relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white text-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#0c1017] dark:text-neutral-100 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'>
        {/* Top Tab Bar & Window Controls */}
        <div className='border-b border-neutral-200/90 bg-neutral-100/90 px-5 py-3.5 dark:border-white/10 dark:bg-[#131823]/95'>
          <div className='mb-3 flex items-center justify-between'>
            {/* macOS Window Controls */}
            <div className='flex items-center gap-1.5'>
              <span className='size-2.5 rounded-full bg-red-500/80 transition-colors hover:bg-red-500' />
              <span className='size-2.5 rounded-full bg-amber-500/80 transition-colors hover:bg-amber-500' />
              <span className='size-2.5 rounded-full bg-emerald-500/80 transition-colors hover:bg-emerald-500' />
              <span className='ml-2.5 hidden font-mono text-[11px] text-neutral-500 sm:inline dark:text-neutral-400'>
                terminal — new-api-gateway
              </span>
            </div>

            {/* Play/Pause toggle & Live Badge */}
            <div className='flex items-center gap-2.5'>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  setIsManuallyPaused((prev) => !prev)
                }}
                className='cursor-pointer rounded-md p-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                title={isManuallyPaused ? t('Resume auto-switch') : t('Pause auto-switch')}
                aria-label={isManuallyPaused ? t('Resume auto-switch') : t('Pause auto-switch')}
              >
                {isManuallyPaused ? <Play className='size-3.5' /> : <Pause className='size-3.5' />}
              </button>
              <div className='flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:border-emerald-500/20 dark:text-emerald-400'>
                <span className='size-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400' />
                <span>ROUTED VIA NEW API</span>
              </div>
            </div>
          </div>

          {/* Clean Horizontal Tabs without progress bar */}
          <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5'>
            {cliProfiles.map((p, idx) => {
              const isSelected = activeIndex === idx
              return (
                <button
                  key={p.id}
                  type='button'
                  onClick={() => handleSelectTab(idx)}
                  className={cn(
                    'relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    isSelected
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId='active-cli-tab'
                      className='absolute inset-0 rounded-lg border border-neutral-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#1c2333]'
                      transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                    />
                  )}
                  <span className='relative z-10 flex size-4 shrink-0 items-center justify-center'>
                    {p.icon === 'Zap' ? (
                      <Zap className='size-3.5 text-amber-500 dark:text-amber-400' />
                    ) : (
                      getLobeIcon(p.icon, 16)
                    )}
                  </span>
                  <span className='relative z-10'>{p.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Command Line Prompt Bar */}
        <div className='flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50 px-5 py-3 font-mono text-xs text-neutral-700 dark:border-white/10 dark:bg-[#0e121a] dark:text-neutral-300'>
          <div className='flex items-center gap-2 overflow-hidden text-ellipsis'>
            <span className='select-none font-bold text-emerald-600 dark:text-emerald-400'>$</span>
            <span className='truncate font-medium text-neutral-900 dark:text-neutral-100'>{currentProfile.command}</span>
            <span className='inline-block h-3.5 w-1.5 animate-pulse bg-neutral-500 dark:bg-neutral-400' />
          </div>
          <CopyButton
            value={currentProfile.command}
            className='size-6 shrink-0 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            tooltip={t('Copy command')}
          />
        </div>

        {/* Dynamic Terminal Output Area (Spacious vertical height) */}
        <div className='min-h-[380px] md:min-h-[430px] overflow-y-auto bg-neutral-50/50 p-6 md:p-8 dark:bg-[#0a0d14]/90'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentProfile.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {currentProfile.renderOutput()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive Bottom Footer */}
        <div className='flex flex-wrap items-center justify-between border-t border-neutral-200/80 bg-neutral-100/90 px-5 py-3 text-[11px] text-neutral-600 dark:border-white/10 dark:bg-[#10141d] dark:text-neutral-400'>
          <div className='flex items-center gap-2'>
            <div className='size-2 animate-ping rounded-full bg-emerald-500 dark:bg-emerald-400' />
            <span>
              {t('Upstream Failover')}: <span className='font-semibold text-emerald-600 dark:text-emerald-400'>0 Downtime</span>
            </span>
          </div>
          <div className='flex items-center gap-3 font-mono text-xs'>
            <span>baseURL: https://tokenmetro.com/v1</span>
            <span className='text-neutral-400 dark:text-neutral-600'>|</span>
            <span className='font-medium text-neutral-700 dark:text-neutral-300'>{currentProfile.tag}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
