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
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Cpu,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'

import { AnimateInView } from '@/components/animate-in-view'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

export function GatewayFlowVisualizer() {
  const { t } = useTranslation()
  const [failoverActive, setFailoverActive] = useState(false)
  const [requestCount, setRequestCount] = useState(14820)
  const [activeRouteIndex, setActiveRouteIndex] = useState(0)

  // Increment live simulated request counter
  useEffect(() => {
    const timer = setInterval(() => {
      setRequestCount((prev) => prev + Math.floor(Math.random() * 4) + 1)
      setActiveRouteIndex((prev) => (prev + 1) % 3)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id='solutions' className='relative z-10 border-t border-border/40 bg-card/10 py-16 md:py-24 overflow-hidden'>
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20'
      >
        <div className='h-96 w-[600px] rounded-full bg-radial from-neutral-400/10 via-neutral-500/5 to-transparent blur-3xl dark:from-white/5 dark:via-neutral-600/5' />
      </div>

      <div className='mx-auto max-w-6xl px-6'>
        {/* Header */}
        <AnimateInView className='mb-12 text-center'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 shadow-xs'>
            <Activity className='size-3.5 text-neutral-600 dark:text-neutral-400 animate-pulse' />
            <span>{t('Zero-Downtime Smart Routing Topology')}</span>
          </div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground md:text-3xl'>
            {t('Live Gateway Relay & Automatic Failover Engine')}
          </h2>
          <p className='mx-auto mt-2 max-w-2xl text-sm text-muted-foreground/80 md:text-base'>
            {t(
              'Requests from terminal CLIs, IDEs, and backend services are intelligently analyzed, cached, and routed to the healthiest upstream endpoint with zero latency penalty.'
            )}
          </p>
        </AnimateInView>

        {/* Interactive Visualizer Canvas */}
        <div className='relative rounded-3xl border border-border/60 bg-card/60 p-6 md:p-10 backdrop-blur-md shadow-xl dark:bg-card/30'>
          {/* Top Control Bar */}
          <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6'>
            <div className='flex items-center gap-3'>
              <div className='flex size-3 relative'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex size-3 rounded-full bg-emerald-500' />
              </div>
              <span className='text-xs font-semibold uppercase tracking-wider text-foreground'>
                {t('Live Gateway Stream')}
              </span>
              <span className='text-xs font-mono text-muted-foreground'>
                {t('Processed')}: <span className='text-foreground font-bold'>{requestCount.toLocaleString()}</span> reqs
              </span>
            </div>

            {/* Interactive Failover Simulator Button with stable dimensions */}
            <button
              type='button'
              onClick={() => setFailoverActive(!failoverActive)}
              className={cn(
                'inline-flex min-w-[260px] h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-medium transition-all shadow-xs cursor-pointer select-none',
                failoverActive
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-muted hover:bg-muted/80 text-foreground border border-border/60'
              )}
            >
              <RefreshCw className={cn('size-3.5 shrink-0', failoverActive && 'animate-spin text-amber-500')} />
              <span className='truncate'>
                {failoverActive ? t('Simulating Primary Outage (Auto-Rerouted)') : t('Test Auto Failover Reroute')}
              </span>
            </button>
          </div>

          {/* Flow Diagram: Three Columns (Clients -> New API Hub -> Upstreams) */}
          <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center'>
            {/* Left: Client Sources (3 cols) */}
            <div className='space-y-3 lg:col-span-3'>
              <span className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 block mb-2'>
                {t('Client Sources')}
              </span>
              {[
                { name: 'Claude Code CLI', icon: 'Claude.Color', sub: 'Terminal Agent' },
                { name: 'Cursor / Aider IDE', icon: 'Cursor', sub: 'Pair Programming' },
                { name: 'Python / Go SDK', icon: 'OpenAI', sub: 'Backend Microservices' },
              ].map((client, i) => (
                <div
                  key={client.name}
                  className={cn(
                    'flex h-[66px] items-center justify-between rounded-xl border px-3.5 transition-all duration-300',
                    activeRouteIndex === i
                      ? 'border-neutral-400 bg-neutral-200/60 shadow-sm dark:border-neutral-600 dark:bg-white/10'
                      : 'border-border/50 bg-muted/20 hover:border-border'
                  )}
                >
                  <div className='flex items-center gap-2.5'>
                    <div className='flex size-6 shrink-0 items-center justify-center'>
                      {getLobeIcon(client.icon, 18)}
                    </div>
                    <div>
                      <div className='text-xs font-semibold text-foreground'>{client.name}</div>
                      <div className='text-[10px] text-muted-foreground'>{client.sub}</div>
                    </div>
                  </div>
                  <span className='size-1.5 shrink-0 rounded-full bg-neutral-500 dark:bg-neutral-300 animate-pulse' />
                </div>
              ))}
            </div>

            {/* Center: New API Gateway Core (5 cols) */}
            <div className='relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-border/80 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent text-center lg:col-span-6 shadow-lg shadow-black/5 dark:border-white/15 dark:from-white/5 dark:via-transparent'>
              <div className='relative mb-4'>
                {/* Glowing subtle ripple */}
                <div className='absolute -inset-2 rounded-2xl bg-neutral-400/20 blur-md animate-pulse dark:bg-white/10' />
                <div className='relative flex size-16 items-center justify-center rounded-2xl border border-border/80 bg-background text-foreground shadow-md'>
                  <Cpu className='size-8 animate-pulse text-neutral-800 dark:text-neutral-200' />
                </div>
              </div>

              <h3 className='text-lg font-bold text-foreground'>New API Enterprise Core</h3>
              <p className='mt-1 text-xs text-muted-foreground max-w-xs'>
                {t('Dynamic Weight Load Balancer • Token Normalizer • ASVS Guard')}
              </p>

              {/* Status pills inside Hub */}
              <div className='mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-mono'>
                <span className='rounded-md bg-background/80 px-2.5 py-1 border border-border/50 text-emerald-600 dark:text-emerald-400 font-medium'>
                  Latency: 1.8ms
                </span>
                <span className='rounded-md bg-background/80 px-2.5 py-1 border border-border/50 text-neutral-700 dark:text-neutral-300 font-medium'>
                  SSE Stream: Zero-Drop
                </span>
                <span className='rounded-md bg-background/80 px-2.5 py-1 border border-border/50 text-neutral-700 dark:text-neutral-300 font-medium'>
                  Multi-DB & Redis Sync
                </span>
              </div>
            </div>

            {/* Right: Upstream Destinations (3 cols) - Locked heights to prevent layout jitter */}
            <div className='space-y-3 lg:col-span-3'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70'>
                  {t('Upstream Channel Pool')}
                </span>
                <span className='rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground'>
                  Target: gpt-4o
                </span>
              </div>

              {/* Channel 1: Primary OpenAI Direct */}
              <div
                className={cn(
                  'flex h-[66px] items-center justify-between rounded-xl border px-3.5 transition-all duration-300',
                  failoverActive
                    ? 'border-red-500/40 bg-red-500/10 opacity-70'
                    : 'border-emerald-500/40 bg-emerald-500/5'
                )}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='flex size-6 shrink-0 items-center justify-center'>
                    {getLobeIcon('OpenAI', 18)}
                  </div>
                  <div className='min-w-0'>
                    <div className='text-xs font-semibold text-foreground truncate'>OpenAI Direct (US-East)</div>
                    <div className='text-[10px] text-muted-foreground truncate'>{t('Primary Upstream Route')}</div>
                  </div>
                </div>
                <div className='flex h-6 min-w-[95px] shrink-0 items-center justify-end font-mono text-[10px]'>
                  {failoverActive ? (
                    <span className='rounded bg-red-500/15 px-2 py-0.5 font-bold text-red-500'>
                      429 RateLimit
                    </span>
                  ) : (
                    <span className='font-bold text-emerald-500'>
                      38ms • Active
                    </span>
                  )}
                </div>
              </div>

              {/* Channel 2: Hot Standby Target - Azure OpenAI */}
              <div
                className={cn(
                  'flex h-[66px] items-center justify-between rounded-xl border px-3.5 transition-all duration-300',
                  failoverActive
                    ? 'border-emerald-500/60 bg-emerald-500/15 shadow-md shadow-emerald-500/10'
                    : 'border-border/50 bg-muted/20'
                )}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='flex size-6 shrink-0 items-center justify-center'>
                    {getLobeIcon('Azure.Color', 18)}
                  </div>
                  <div className='min-w-0'>
                    <div className='text-xs font-semibold text-foreground truncate'>Azure OpenAI Service</div>
                    <div className='text-[10px] text-muted-foreground truncate'>{t('Same-Model Hot Standby')}</div>
                  </div>
                </div>
                <div className='flex h-6 min-w-[95px] shrink-0 items-center justify-end font-mono text-[10px]'>
                  {failoverActive ? (
                    <span className='rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-500 dark:text-emerald-400'>
                      REROUTED (1.2ms)
                    </span>
                  ) : (
                    <span className='rounded bg-neutral-200/50 dark:bg-white/5 px-2 py-0.5 text-muted-foreground'>
                      Standby
                    </span>
                  )}
                </div>
              </div>

              {/* Channel 3: AWS Bedrock Relay */}
              <div className='flex h-[66px] items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3.5'>
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='flex size-6 shrink-0 items-center justify-center'>
                    {getLobeIcon('Aws.Color', 18)}
                  </div>
                  <div className='min-w-0'>
                    <div className='text-xs font-semibold text-foreground truncate'>AWS Bedrock Relay</div>
                    <div className='text-[10px] text-muted-foreground truncate'>{t('Multi-Region Disaster Recovery')}</div>
                  </div>
                </div>
                <div className='flex h-6 min-w-[95px] shrink-0 items-center justify-end font-mono text-[10px]'>
                  <span className='rounded bg-neutral-200/50 dark:bg-white/5 px-2 py-0.5 text-muted-foreground'>
                    Standby
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Notice: Locked min-height to prevent vertical layout shifts */}
          <div className='mt-8 flex min-h-[52px] flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 p-3.5 text-xs'>
            <div className='flex items-center gap-2 flex-1 min-w-[260px]'>
              <CheckCircle2 className='size-4 text-emerald-500 shrink-0' />
              <span className='text-foreground font-medium'>
                {failoverActive
                  ? t('Primary channel 429 anomaly detected: Gateway rerouted to same-model Azure backup channel in 1.2ms with zero client errors.')
                  : t('All upstream channels healthy. Load distributed dynamically across configured weight ratios.')}
              </span>
            </div>
            <span className='font-mono text-muted-foreground text-[11px] shrink-0'>
              SLO: 99.999% • Packet Loss: 0.00%
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
