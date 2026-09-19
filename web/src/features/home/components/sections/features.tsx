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
  Zap,
  Shield,
  Layers,
  ArrowLeftRight,
  CheckCircle2,
  Lock,
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
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 shadow-xs'>
            <Layers className='size-3.5 text-neutral-600 dark:text-neutral-400' />
            <span>{t('Core Capabilities')}</span>
          </div>
          <h2 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
            {t('Engineered for High-Concurrency AI Workloads')}
          </h2>
          <p className='mx-auto mt-3 max-w-2xl text-sm text-muted-foreground/80 md:text-base'>
            {t(
              'A robust, production-ready gateway offering enterprise security, dynamic routing, transparent accounting, and protocol interop.'
            )}
          </p>
        </AnimateInView>

        {/* Bento Box Grid */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
          {/* Bento Item 1: Large Span 2 - Smart Routing & Failover */}
          <AnimateInView
            animation='fade-up'
            delay={0}
            className='group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-6 md:col-span-2 md:p-8 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <Zap className='size-5.5' />
              </div>
              <h3 className='mt-5 text-xl font-bold tracking-tight text-foreground'>
                {t('Smart Multi-Channel Routing & Auto-Failover')}
              </h3>
              <p className='mt-2 max-w-xl text-sm text-muted-foreground/80 leading-relaxed'>
                {t(
                  'Distribute traffic across dozens of upstream channels by weight or priority. Automatically retry healthy alternatives within milliseconds when upstream rate limits or outages occur.'
                )}
              </p>
            </div>

            {/* Interactive Visual Element */}
            <div className='mt-6 rounded-2xl border border-border/50 bg-background/60 p-4 font-mono text-xs'>
              <div className='flex items-center justify-between border-b border-border/40 pb-2.5 text-muted-foreground'>
                <span className='font-sans font-medium'>{t('Active Channel Health')}</span>
                <span className='flex items-center gap-1.5 text-emerald-500'>
                  <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                  {t('Optimal')}
                </span>
              </div>
              <div className='mt-3 space-y-2.5'>
                <div className='flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex size-5 items-center justify-center'>
                      {getLobeIcon('OpenAI', 16)}
                    </div>
                    <span className='text-foreground font-sans font-medium'>OpenAI Tier-5 Cluster</span>
                  </div>
                  <span className='text-emerald-500 font-semibold'>42ms • 100% Health</span>
                </div>
                <div className='flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex size-5 items-center justify-center'>
                      {getLobeIcon('Claude.Color', 16)}
                    </div>
                    <span className='text-foreground font-sans font-medium'>AWS Bedrock Claude Sonnet</span>
                  </div>
                  <span className='text-emerald-500 font-semibold'>68ms • 100% Health</span>
                </div>
                <div className='flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex size-5 items-center justify-center'>
                      {getLobeIcon('DeepSeek.Color', 16)}
                    </div>
                    <span className='text-foreground font-sans font-medium'>DeepSeek Official Direct</span>
                  </div>
                  <span className='text-neutral-600 dark:text-neutral-400 font-semibold'>28ms • Failover Standby</span>
                </div>
              </div>
            </div>
          </AnimateInView>

          {/* Bento Item 2: Span 1 - Enterprise Security */}
          <AnimateInView
            animation='fade-up'
            delay={100}
            className='group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-6 md:p-8 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <Shield className='size-5.5' />
              </div>
              <h3 className='mt-5 text-xl font-bold tracking-tight text-foreground'>
                {t('OWASP ASVS Grade Security')}
              </h3>
              <p className='mt-2 text-sm text-muted-foreground/80 leading-relaxed'>
                {t(
                  'Comprehensive protection including WebAuthn Passkeys, 2FA, token rate-limiting, IP whitelists, and SSRF defenses.'
                )}
              </p>
            </div>

            <div className='mt-6 space-y-2 rounded-2xl border border-border/50 bg-background/60 p-4 text-xs'>
              <div className='flex items-center gap-2 text-foreground font-medium'>
                <Lock className='size-3.5 text-emerald-500' />
                <span>{t('Strict Token Isolation')}</span>
              </div>
              <div className='flex items-center gap-2 text-foreground font-medium'>
                <CheckCircle2 className='size-3.5 text-emerald-500' />
                <span>{t('No Secret Leakage in Logs')}</span>
              </div>
              <div className='flex items-center gap-2 text-foreground font-medium'>
                <CheckCircle2 className='size-3.5 text-emerald-500' />
                <span>{t('Sub-token Group Permissions')}</span>
              </div>
            </div>
          </AnimateInView>

          {/* Bento Item 3: Span 1 - Transparent Quota & Billing */}
          <AnimateInView
            animation='fade-up'
            delay={150}
            className='group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-6 md:p-8 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <Wallet className='size-5.5' />
              </div>
              <h3 className='mt-5 text-xl font-bold tracking-tight text-foreground'>
                {t('Overflow-Safe Billing Engine')}
              </h3>
              <p className='mt-2 text-sm text-muted-foreground/80 leading-relaxed'>
                {t(
                  'Dynamic pricing expressions for prompt caching, reasoning tokens, and task durations. Pre-deduction and settlement prevent debt.'
                )}
              </p>
            </div>

            <div className='mt-6 rounded-2xl border border-border/50 bg-background/60 p-4 text-xs space-y-2'>
              <div className='flex justify-between items-center text-muted-foreground'>
                <span>{t('Input Tokens')}</span>
                <span className='font-mono font-medium text-foreground'>$0.002 / 1K</span>
              </div>
              <div className='flex justify-between items-center text-muted-foreground'>
                <span>{t('Prompt Caching')}</span>
                <span className='font-mono font-medium text-emerald-500'>-80% Discount</span>
              </div>
              <div className='flex justify-between items-center text-muted-foreground'>
                <span>{t('Settlement Precision')}</span>
                <span className='font-mono font-medium text-foreground'>int32 Safe Clamping</span>
              </div>
            </div>
          </AnimateInView>

          {/* Bento Item 4: Large Span 2 - Full Protocol Translation */}
          <AnimateInView
            animation='fade-up'
            delay={200}
            className='group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-6 md:col-span-2 md:p-8 backdrop-blur-xs transition-all duration-300 hover:border-neutral-400/80 hover:shadow-xl hover:shadow-black/5 dark:hover:border-white/20 dark:hover:shadow-black/20'
          >
            <div>
              <div className='flex size-11 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'>
                <ArrowLeftRight className='size-5.5' />
              </div>
              <h3 className='mt-5 text-xl font-bold tracking-tight text-foreground'>
                {t('Bidirectional Multi-Protocol Interop')}
              </h3>
              <p className='mt-2 max-w-xl text-sm text-muted-foreground/80 leading-relaxed'>
                {t(
                  'Send OpenAI formatted requests to Claude or Gemini, or call native Anthropic Messages API. New API translates payload structures, tools/function calls, and SSE stream chunks automatically.'
                )}
              </p>
            </div>

            {/* Protocol conversion pipeline illustration */}
            <div className='mt-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border/50 bg-background/60 p-4 text-xs'>
              <span className='rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 font-mono font-medium text-foreground'>
                OpenAI /v1/chat
              </span>
              <ArrowLeftRight className='size-4 text-neutral-400 dark:text-neutral-500 shrink-0' />
              <span className='rounded-md border border-neutral-300 bg-neutral-200/80 px-3 py-1.5 font-mono font-medium text-neutral-800 dark:border-white/15 dark:bg-white/10 dark:text-white'>
                New API Core (RelayKit)
              </span>
              <ArrowLeftRight className='size-4 text-neutral-400 dark:text-neutral-500 shrink-0' />
              <div className='flex gap-1.5'>
                <span className='rounded-md border border-border/40 bg-muted/30 px-2.5 py-1.5 font-mono text-muted-foreground'>
                  Claude
                </span>
                <span className='rounded-md border border-border/40 bg-muted/30 px-2.5 py-1.5 font-mono text-muted-foreground'>
                  Gemini
                </span>
                <span className='rounded-md border border-border/40 bg-muted/30 px-2.5 py-1.5 font-mono text-muted-foreground'>
                  Midjourney
                </span>
              </div>
            </div>
          </AnimateInView>
        </div>
      </div>
    </section>
  )
}
