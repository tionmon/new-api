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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldCheck,
} from 'lucide-react'

import { AnimateInView } from '@/components/animate-in-view'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

export function GatewayFlowVisualizer() {
  const { t } = useTranslation()
  const [failoverActive, setFailoverActive] = useState(false)
  const [activeClientIndex, setActiveClientIndex] = useState(0)

  // Rotating client activity
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveClientIndex((prev) => (prev + 1) % 3)
    }, 2400)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      id='solutions'
      className='scroll-mt-16 md:scroll-mt-20 border-border/40 bg-card/10 relative z-10 overflow-hidden border-t py-16 md:py-24'
    >
      {/* 60fps/120fps hardware-accelerated linear flow with zero stutter/jitter */}
      <style>{`
        @keyframes flowDashSmooth {
          from {
            stroke-dashoffset: 28;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes linearPulseTrack {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .flow-dash-line {
          stroke-dasharray: 6 8;
          animation: flowDashSmooth 2.4s linear infinite;
          will-change: stroke-dashoffset;
        }
        .linear-pulse-beam {
          animation: linearPulseTrack 2.6s linear infinite;
          will-change: transform;
        }
      `}</style>

      {/* Subtle background ambient lens glow */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-25 dark:opacity-15'
      >
        <div className='h-96 w-[720px] rounded-full bg-radial from-emerald-500/15 via-neutral-500/5 to-transparent blur-3xl' />
      </div>

      <div className='mx-auto max-w-6xl px-6'>
        {/* Header: Professional, high-availability & concurrency focus */}
        <AnimateInView className='mb-12 text-center'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3.5 py-1 text-xs font-medium text-neutral-800 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-neutral-300'>
            <ShieldCheck className='size-3.5 text-emerald-600 dark:text-emerald-400' />
            <span>{t('Smart Multi-Route Failover • Always Connected')}</span>
          </div>
          <h2 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
            {t('Multi-Account Smart Failover: Seamless AI Requests That Never Drop')}
          </h2>
          <p className='text-muted-foreground/90 mx-auto mt-3 max-w-2xl text-sm leading-relaxed md:text-base'>
            {t(
              'Multiple upstream accounts run actively in parallel. If any account encounters rate limits or network issues, its route is instantly severed and traffic seamlessly shifts to healthy accounts without interruption.'
            )}
          </p>
        </AnimateInView>

        {/* Visualizer Canvas Frame: Consistent, stable, no visual layout fragmentation */}
        <div className='border-border/60 bg-card/60 dark:bg-card/30 relative overflow-hidden rounded-3xl border p-6 shadow-xl backdrop-blur-md md:p-8 lg:p-10'>
          {/* Continuous Penetrating Flow Guideline (Through the entire component width) */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -left-12 -right-12 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dark:via-emerald-500/10'
          />

          {/* Top Control Bar: Stable layout, fixed text, smooth toggle switch */}
          <div className='border-border/40 relative z-10 flex flex-wrap items-center justify-between gap-4 border-b pb-6'>
            <div className='flex items-center gap-2.5'>
              <div className='relative flex size-2.5'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex size-2.5 rounded-full bg-emerald-500' />
              </div>
              <span className='text-foreground text-xs font-semibold tracking-wider uppercase'>
                {t('Multiple Upstream Channels Running Concurrently')}
              </span>
            </div>

            {/* Interactive Failover Simulator: Stable switch, zero layout jumps */}
            <button
              type='button'
              onClick={() => setFailoverActive(!failoverActive)}
              className='inline-flex h-9 items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/40 px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 cursor-pointer select-none'
              title={t('Simulate Failure')}
            >
              <span className='text-muted-foreground text-xs font-medium'>
                {t('Simulate Failure')}
              </span>
              <div
                className={cn(
                  'relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-300',
                  failoverActive ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                )}
              >
                <span
                  className={cn(
                    'size-3 rounded-full bg-white transition-transform duration-300 shadow-xs',
                    failoverActive ? 'translate-x-3.5' : 'translate-x-0.5'
                  )}
                />
              </div>
            </button>
          </div>

          {/* Main 3-Stage Pipeline: Stable structure, never mutates on simulation */}
          <div className='relative z-10 mt-8 grid grid-cols-1 items-center gap-6 lg:grid-cols-12'>
            {/* Stage 1: Client Dev Tools (3 cols) */}
            <div className='space-y-3 lg:col-span-3'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-muted-foreground/80 text-xs font-bold tracking-wider uppercase'>
                  {t('1. Your Apps & Tools')}
                </span>
                <span className='inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                  <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
                  {t('Continuous Requests')}
                </span>
              </div>

              {[
                {
                  name: 'Cursor',
                  icon: 'Cursor',
                  sub: 'AI Code Editor',
                },
                {
                  name: 'Claude Code',
                  icon: 'Claude.Color',
                  sub: 'Terminal Agent',
                },
                {
                  name: 'API / SDK',
                  icon: 'OpenAI',
                  sub: 'Enterprise Systems',
                },
              ].map((client, i) => (
                <div
                  key={client.name}
                  className={cn(
                    'flex h-[58px] items-center justify-between rounded-xl border px-3.5 transition-all duration-300',
                    activeClientIndex === i
                      ? 'border-emerald-500/50 bg-emerald-500/5 shadow-sm dark:border-emerald-500/40'
                      : 'border-border/50 bg-muted/20 hover:border-border'
                  )}
                >
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <div className='border-border/40 bg-card flex size-8 shrink-0 items-center justify-center rounded-lg border'>
                      {getLobeIcon(client.icon, 18)}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-foreground truncate text-xs font-semibold'>
                        {client.name}
                      </div>
                      <div className='text-muted-foreground truncate text-[10.5px]'>
                        {client.sub}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full transition-all duration-300',
                      activeClientIndex === i
                        ? 'bg-emerald-500 shadow-xs shadow-emerald-500 scale-110'
                        : 'bg-muted-foreground/30'
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Stream Connector 1: Dev Tools -> Center Hub */}
            <div className='flex flex-col items-center justify-center py-2 lg:col-span-1 lg:py-0'>
              <div className='hidden w-full flex-col items-center justify-center gap-1.5 lg:flex'>
                <div className='relative h-1 w-full overflow-hidden rounded-full bg-neutral-200/90 dark:bg-neutral-800/90 shadow-inner'>
                  <div className='linear-pulse-beam absolute inset-y-0 w-24 rounded-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)]' />
                </div>
                <ArrowRight className='size-3 text-emerald-600 dark:text-emerald-400 opacity-80' />
              </div>
              <div className='flex w-full flex-col items-center justify-center gap-1 py-2 lg:hidden'>
                <div className='relative h-8 w-1 overflow-hidden rounded-full bg-neutral-200/90 dark:bg-neutral-800/90 shadow-inner'>
                  <div className='linear-pulse-beam absolute inset-x-0 h-8 rounded-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)]' />
                </div>
                <ArrowDown className='size-3 text-emerald-600 dark:text-emerald-400 opacity-80' />
              </div>
            </div>

            {/* Stage 2: API Smart Routing Hub (Stable, serene, no layout or text jumps) */}
            <div className='border-border/80 from-muted/30 via-muted/10 relative flex flex-col items-center justify-center rounded-2xl border-2 bg-gradient-to-b to-transparent p-6 text-center shadow-lg lg:col-span-4 dark:border-white/15 dark:from-white/5 dark:via-transparent'>
              <div className='relative mb-3'>
                <div className='absolute -inset-2.5 rounded-2xl bg-emerald-400/20 blur-md dark:bg-emerald-400/15' />
                <div className='border-border/80 bg-background text-foreground relative flex size-14 items-center justify-center rounded-2xl border shadow-md'>
                  <Cpu className='size-7 text-emerald-500' />
                </div>
              </div>

              <h3 className='text-foreground text-base font-bold'>
                {t('API Smart Routing Hub')}
              </h3>
              <p className='text-muted-foreground mt-1 max-w-xs text-xs leading-relaxed'>
                {t('Parallel Concurrency Pooling • Instant Auto Failover')}
              </p>

              {/* Stable status badge (Never jumps or changes height) */}
              <div className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-3.5 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium'>
                <CheckCircle2 className='size-3.5 shrink-0 text-emerald-500' />
                <span>{t('Active-Active Concurrency Pooling')}</span>
              </div>

              {/* Feature Capability Tags */}
              <div className='mt-3 flex flex-wrap justify-center gap-1.5 text-[10px]'>
                <span className='bg-background/80 border-border/50 text-muted-foreground rounded-md border px-2 py-0.5'>
                  {t('Active-Active Concurrency')}
                </span>
                <span className='bg-background/80 border-border/50 text-muted-foreground rounded-md border px-2 py-0.5'>
                  {t('Auto Circuit Breaker')}
                </span>
                <span className='bg-background/80 border-border/50 text-muted-foreground rounded-md border px-2 py-0.5'>
                  {t('Zero Request Loss')}
                </span>
              </div>
            </div>

            {/* Stream Connector 2: Hub -> 4 Channels (Simulation lives here on the lines!) */}
            <div className='relative flex h-full items-center justify-center py-2 lg:col-span-1 lg:py-0'>
              {/* Desktop 4-Branching Fine SVG Curves */}
              <div className='hidden h-[260px] w-full items-center justify-center lg:flex'>
                <svg
                  className='h-full w-full overflow-visible'
                  viewBox='0 0 100 200'
                  preserveAspectRatio='none'
                  fill='none'
                >
                  {/* Channel 1 Path (to y=25) — Disconnects and stops flow during failover */}
                  <path
                    d='M 0,100 C 40,100 60,25 100,25'
                    stroke='currentColor'
                    className='text-neutral-200 dark:text-neutral-800'
                    strokeWidth='1.5'
                  />
                  <path
                    d='M 0,100 C 40,100 60,25 100,25'
                    stroke={failoverActive ? '#ef4444' : '#10b981'}
                    strokeWidth={failoverActive ? '1' : '1.8'}
                    strokeDasharray={failoverActive ? '2 6' : '6 8'}
                    className={cn(
                      'transition-all duration-500',
                      failoverActive
                        ? 'opacity-20'
                        : 'flow-dash-line drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]'
                    )}
                  />

                  {/* Channel 2 Path (to y=75) — Continuous smooth flow */}
                  <path
                    d='M 0,100 C 40,100 60,75 100,75'
                    stroke='currentColor'
                    className='text-neutral-200 dark:text-neutral-800'
                    strokeWidth='1.5'
                  />
                  <path
                    d='M 0,100 C 40,100 60,75 100,75'
                    stroke='#10b981'
                    strokeWidth='1.8'
                    className='flow-dash-line drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]'
                  />

                  {/* Channel 3 Path (to y=125) — Continuous smooth flow */}
                  <path
                    d='M 0,100 C 40,100 60,125 100,125'
                    stroke='currentColor'
                    className='text-neutral-200 dark:text-neutral-800'
                    strokeWidth='1.5'
                  />
                  <path
                    d='M 0,100 C 40,100 60,125 100,125'
                    stroke='#10b981'
                    strokeWidth='1.8'
                    className='flow-dash-line drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]'
                  />

                  {/* Channel 4 Path (to y=175) — Continuous smooth flow */}
                  <path
                    d='M 0,100 C 40,100 60,175 100,175'
                    stroke='currentColor'
                    className='text-neutral-200 dark:text-neutral-800'
                    strokeWidth='1.5'
                  />
                  <path
                    d='M 0,100 C 40,100 60,175 100,175'
                    stroke='#10b981'
                    strokeWidth='1.8'
                    className='flow-dash-line drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]'
                  />
                </svg>
              </div>

              {/* Mobile vertical conduit */}
              <div className='flex w-full flex-col items-center justify-center gap-1 py-2 lg:hidden'>
                <div className='relative h-8 w-1 overflow-hidden rounded-full bg-neutral-200/90 dark:bg-neutral-800/90 shadow-inner'>
                  <div className='linear-pulse-beam absolute inset-x-0 h-8 rounded-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)]' />
                </div>
                <ArrowDown className='size-3 text-emerald-600 dark:text-emerald-400 opacity-80' />
              </div>
            </div>

            {/* Stage 3: Upstream Multi-Account Pool (Stable, elegant cards with zero layout jumping) */}
            <div className='space-y-2.5 lg:col-span-3'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-muted-foreground/80 text-xs font-bold tracking-wider uppercase'>
                  {t('Multi-Account Upstream Pool')}
                </span>
                <span className='border-border/60 bg-muted/40 text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] font-medium'>
                  {t('Multiple Upstream Channels Running Concurrently')}
                </span>
              </div>

              {/* Channel 1: GPT Pro 20X - 01 */}
              <div className='relative group'>
                <div className='border-border/50 bg-muted/20 flex h-[54px] items-center justify-between rounded-xl border px-3 transition-colors'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <div className='border-border/40 bg-card flex size-7 shrink-0 items-center justify-center rounded-lg border'>
                      {getLobeIcon('OpenAI', 16)}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-foreground truncate text-xs font-semibold'>
                        GPT Pro 20X - 01
                      </div>
                      <div className='text-muted-foreground truncate text-[10px]'>
                        {t('Smooth & Connected')}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <span
                      className={cn(
                        'size-2 rounded-full transition-colors duration-500',
                        failoverActive
                          ? 'bg-neutral-400/60 dark:bg-neutral-600'
                          : 'bg-emerald-500 shadow-xs shadow-emerald-500'
                      )}
                    />
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-medium transition-colors duration-500',
                        failoverActive
                          ? 'bg-neutral-200/80 text-neutral-600 dark:bg-white/10 dark:text-neutral-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                      )}
                    >
                      {failoverActive ? t('Cutoff') : t('Active')}
                    </span>
                  </div>
                </div>
                {/* Right-extending fine laser trail */}
                <div
                  aria-hidden='true'
                  className={cn(
                    'pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 hidden h-[1.5px] w-6 lg:block transition-opacity duration-500',
                    failoverActive
                      ? 'opacity-20 bg-neutral-400'
                      : 'bg-gradient-to-r from-emerald-500/50 to-transparent'
                  )}
                />
              </div>

              {/* Channel 2: GPT Pro 20X - 02 */}
              <div className='relative group'>
                <div className='border-border/50 bg-muted/20 flex h-[54px] items-center justify-between rounded-xl border px-3 transition-colors'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <div className='border-border/40 bg-card flex size-7 shrink-0 items-center justify-center rounded-lg border'>
                      {getLobeIcon('OpenAI', 16)}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-foreground truncate text-xs font-semibold'>
                        GPT Pro 20X - 02
                      </div>
                      <div className='text-muted-foreground truncate text-[10px]'>
                        {t('Smooth & Connected')}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <span className='size-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500' />
                    <span className='rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                      {t('Active')}
                    </span>
                  </div>
                </div>
                <div
                  aria-hidden='true'
                  className='pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 hidden h-[1.5px] w-6 lg:block bg-gradient-to-r from-emerald-500/50 to-transparent'
                />
              </div>

              {/* Channel 3: GPT Pro 20X - 03 */}
              <div className='relative group'>
                <div className='border-border/50 bg-muted/20 flex h-[54px] items-center justify-between rounded-xl border px-3 transition-colors'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <div className='border-border/40 bg-card flex size-7 shrink-0 items-center justify-center rounded-lg border'>
                      {getLobeIcon('OpenAI', 16)}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-foreground truncate text-xs font-semibold'>
                        GPT Pro 20X - 03
                      </div>
                      <div className='text-muted-foreground truncate text-[10px]'>
                        {t('Smooth & Connected')}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <span className='size-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500' />
                    <span className='rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                      {t('Active')}
                    </span>
                  </div>
                </div>
                <div
                  aria-hidden='true'
                  className='pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 hidden h-[1.5px] w-6 lg:block bg-gradient-to-r from-emerald-500/50 to-transparent'
                />
              </div>

              {/* Channel 4: 微软云 Azure */}
              <div className='relative group'>
                <div className='border-border/50 bg-muted/20 flex h-[54px] items-center justify-between rounded-xl border px-3 transition-colors'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <div className='border-border/40 bg-card flex size-7 shrink-0 items-center justify-center rounded-lg border'>
                      {getLobeIcon('Azure.Color', 16)}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-foreground truncate text-xs font-semibold'>
                        {t('Microsoft Azure Cloud')}
                      </div>
                      <div className='text-muted-foreground truncate text-[10px]'>
                        {t('Smooth & Connected')}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <span className='size-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500' />
                    <span className='rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                      {t('Active')}
                    </span>
                  </div>
                </div>
                <div
                  aria-hidden='true'
                  className='pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 hidden h-[1.5px] w-6 lg:block bg-gradient-to-r from-emerald-500/50 to-transparent'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
