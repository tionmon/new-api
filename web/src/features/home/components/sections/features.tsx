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
  BarChart3,
  CheckCircle2,
  KeyRound,
  Layers,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { getLobeIcon } from '@/lib/lobe-icon'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 px-6 py-20 md:py-28'>
      <div className='mx-auto max-w-6xl'>
        {/* Section Header */}
        <AnimateInView className='mb-16 text-center md:mb-20'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3.5 py-1.5 text-xs font-medium text-neutral-800 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-neutral-300'>
            <Layers className='size-3.5 text-neutral-600 dark:text-neutral-400' />
            <span>{t('Core Capabilities')}</span>
          </div>
          <h2 className='text-foreground text-3xl font-bold tracking-tight md:text-4xl'>
            {t('Engineered for Everyone: Simple, Powerful & Transparent')}
          </h2>
          <p className='text-muted-foreground/80 mx-auto mt-3 max-w-2xl text-sm md:text-base'>
            {t(
              'From individual developers to growing teams, manage models, quotas, and access channels all in one place.'
            )}
          </p>
        </AnimateInView>

        {/* Bento Box Grid */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
          {/* Bento Item 1: Large Span 2 - Unified Model Access */}
          <AnimateInView
            animation='fade-up'
            delay={0}
            className='group border-border/60 from-card/80 to-card/40 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-6 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 md:col-span-2 md:p-8 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <KeyRound className='size-5.5' />
              </div>
              <h3 className='text-foreground mt-5 text-xl font-bold tracking-tight'>
                {t('Unified Model Access: One Key For Everything')}
              </h3>
              <p className='text-muted-foreground/80 mt-2 max-w-xl text-sm leading-relaxed'>
                {t(
                  'No need to register dozens of accounts or manage fragmented keys. Access leading commercial and open-source models through a single standard endpoint across all your tools.'
                )}
              </p>
            </div>

            {/* Visual Element: Converging model logos */}
            <div className='border-border/50 bg-background/60 mt-6 rounded-2xl border p-4 text-xs'>
              <div className='border-border/40 flex flex-wrap items-center justify-between gap-2 border-b pb-3'>
                <span className='text-foreground flex items-center gap-1.5 font-medium'>
                  <Sparkles className='text-primary size-3.5' />
                  {t('Chat • Coding • Drawing • Multimodal')}
                </span>
                <span className='rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                  100% OpenAI Compatible
                </span>
              </div>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                {[
                  { name: 'OpenAI', icon: 'OpenAI' },
                  { name: 'Anthropic', icon: 'Claude.Color' },
                  { name: 'Google', icon: 'Gemini.Color' },
                  { name: 'DeepSeek', icon: 'DeepSeek.Color' },
                  { name: 'Mistral', icon: 'Mistral.Color' },
                  { name: 'Midjourney', icon: 'Midjourney' },
                ].map((m) => (
                  <div
                    key={m.name}
                    className='border-border/40 bg-muted/20 text-foreground flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium'
                  >
                    <div className='flex size-4.5 items-center justify-center'>
                      {getLobeIcon(m.icon, 16)}
                    </div>
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimateInView>

          {/* Bento Item 2: Span 1 - Transparent Quota & Budget */}
          <AnimateInView
            animation='fade-up'
            delay={100}
            className='group border-border/60 from-card/80 to-card/40 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-6 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 md:p-8 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <Wallet className='size-5.5' />
              </div>
              <h3 className='text-foreground mt-5 text-xl font-bold tracking-tight'>
                {t('Transparent Budget & Quota Control')}
              </h3>
              <p className='text-muted-foreground/80 mt-2 text-sm leading-relaxed'>
                {t(
                  'Set token quotas, daily budgets, or use redemption cards. Real-time billing prevents unexpected overage so you always stay fully in control.'
                )}
              </p>
            </div>

            <div className='border-border/50 bg-background/60 mt-6 space-y-2 rounded-2xl border p-4 text-xs'>
              <div className='text-foreground flex items-center gap-2 font-medium'>
                <CheckCircle2 className='size-3.5 shrink-0 text-emerald-500' />
                <span>{t('Pre-allocated Quotas')}</span>
              </div>
              <div className='text-foreground flex items-center gap-2 font-medium'>
                <CheckCircle2 className='size-3.5 shrink-0 text-emerald-500' />
                <span>{t('Zero Overage Risk')}</span>
              </div>
              <div className='text-foreground flex items-center gap-2 font-medium'>
                <CheckCircle2 className='size-3.5 shrink-0 text-emerald-500' />
                <span>{t('Redemption Cards Supported')}</span>
              </div>
            </div>
          </AnimateInView>

          {/* Bento Item 3: Span 1 - Team Collaboration & Group Routing */}
          <AnimateInView
            animation='fade-up'
            delay={150}
            className='group border-border/60 from-card/80 to-card/40 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-6 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 md:p-8 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <Users className='size-5.5' />
              </div>
              <h3 className='text-foreground mt-5 text-xl font-bold tracking-tight'>
                {t('Team Collaboration & Group Channel Routing')}
              </h3>
              <p className='text-muted-foreground/80 mt-2 text-sm leading-relaxed'>
                {t(
                  'Assign users to different tiers like free trial or VIP dedicated channels. Keep your master upstream credentials completely private and secure.'
                )}
              </p>
            </div>

            <div className='border-border/50 bg-background/60 mt-6 space-y-2 rounded-2xl border p-4 text-xs'>
              <div className='text-muted-foreground flex items-center justify-between'>
                <span>{t('Standard Channel')}</span>
                <span className='text-foreground font-medium'>
                  Default Tier
                </span>
              </div>
              <div className='text-muted-foreground flex items-center justify-between'>
                <span>{t('VIP Dedicated Line')}</span>
                <span className='font-medium text-emerald-500'>
                  High-Speed Priority
                </span>
              </div>
              <div className='text-muted-foreground flex items-center justify-between'>
                <span>{t('Master Keys Concealed')}</span>
                <span className='text-foreground font-medium'>100% Safe</span>
              </div>
            </div>
          </AnimateInView>

          {/* Bento Item 4: Large Span 2 - Visual Analytics & Logs */}
          <AnimateInView
            animation='fade-up'
            delay={200}
            className='group border-border/60 from-card/80 to-card/40 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-6 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 md:col-span-2 md:p-8 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <BarChart3 className='size-5.5' />
              </div>
              <h3 className='text-foreground mt-5 text-xl font-bold tracking-tight'>
                {t('Visual Analytics & Complete Audit Logs')}
              </h3>
              <p className='text-muted-foreground/80 mt-2 max-w-xl text-sm leading-relaxed'>
                {t(
                  'Track request volume, latency trends, and model consumption distribution with intuitive charts. Every single request is traceable whenever you need it.'
                )}
              </p>
            </div>

            {/* Metrics Chips */}
            <div className='border-border/50 bg-background/60 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-xs'>
              <div className='flex items-center gap-2'>
                <span className='size-2 animate-pulse rounded-full bg-emerald-500' />
                <span className='text-foreground font-medium'>
                  {t('Real-time Call Charts')}
                </span>
              </div>
              <div className='text-muted-foreground flex items-center gap-2'>
                <CheckCircle2 className='size-3.5 text-emerald-500' />
                <span>{t('Detailed Token Logs')}</span>
              </div>
              <div className='text-muted-foreground flex items-center gap-2'>
                <span className='text-foreground font-mono font-medium'>
                  P95 &lt; 50ms
                </span>
              </div>
            </div>
          </AnimateInView>
        </div>
      </div>
    </section>
  )
}
