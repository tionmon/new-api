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
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Activity, ArrowRight, KeyRound, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { HeroCliShowcase } from '../hero-cli-showcase'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

/**
 * Animated Typewriter Title component:
 * Types out Line 1 ("简单操作"), then Line 2 ("即刻AI"), with a smooth pulsing cursor.
 * Uses invisible ghost text to ensure zero layout shift from frame 0.
 */
function TypewriterTitle() {
  const { t } = useTranslation()
  const line1 = t('Simple Operations')
  const line2 = t('Instant AI')
  const [typed1, setTyped1] = useState('')
  const [typed2, setTyped2] = useState('')
  const [phase, setPhase] = useState<'typing1' | 'typing2' | 'done'>('typing1')

  useEffect(() => {
    setTyped1('')
    setTyped2('')
    setPhase('typing1')

    let i = 0
    let j = 0
    let timer: ReturnType<typeof setTimeout>

    function typeLine1() {
      if (i < line1.length) {
        i++
        setTyped1(line1.slice(0, i))
        timer = setTimeout(typeLine1, 80)
      } else {
        setPhase('typing2')
        timer = setTimeout(typeLine2, 220)
      }
    }

    function typeLine2() {
      if (j < line2.length) {
        j++
        setTyped2(line2.slice(0, j))
        timer = setTimeout(typeLine2, 90)
      } else {
        setPhase('done')
      }
    }

    timer = setTimeout(typeLine1, 160)

    return () => clearTimeout(timer)
  }, [line1, line2])

  return (
    <h1 className='landing-animate-fade-up text-[clamp(2.6rem,5.5vw,4.2rem)] leading-[1.12] font-black tracking-tight text-foreground'>
      <div className='relative text-neutral-900 dark:text-white'>
        <span>{typed1}</span>
        {phase === 'typing1' && (
          <span className='inline-block w-[3px] h-[0.85em] ml-1.5 -mb-0.5 bg-neutral-900 dark:bg-white animate-pulse' />
        )}
        <span className='invisible select-none' aria-hidden>{line1.slice(typed1.length)}</span>
      </div>
      <div className='relative mt-1 bg-gradient-to-b from-neutral-950 via-neutral-800 to-neutral-500 bg-clip-text text-transparent dark:from-white dark:via-neutral-100 dark:to-neutral-400'>
        <span>{typed2}</span>
        {(phase === 'typing2' || phase === 'done') && (
          <span className='inline-block w-[3px] h-[0.85em] ml-1.5 -mb-0.5 bg-neutral-800 dark:bg-neutral-200 animate-pulse' />
        )}
        <span className='invisible select-none' aria-hidden>{line2.slice(typed2.length)}</span>
      </div>
    </h1>
  )
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()

  const steps = [
    {
      num: '01',
      title: t('Create Unified Key'),
      desc: t(
        'Generate standard API tokens or aggregate 40+ upstream vendor channels'
      ),
      icon: <KeyRound className='size-4 text-neutral-700 dark:text-neutral-300' />,
    },
    {
      num: '02',
      title: t('Configure Base URL'),
      desc: t(
        'Set baseURL to /v1 in Claude Code, Cursor, Aider, or custom SDKs'
      ),
      icon: <Terminal className='size-4 text-neutral-700 dark:text-neutral-300' />,
    },
    {
      num: '03',
      title: t('Stream & Auto-Failover'),
      desc: t(
        'Enjoy millisecond streaming inference with zero-downtime multi-channel failover'
      ),
      icon: <Activity className='size-4 text-neutral-700 dark:text-neutral-300' />,
    },
  ]

  return (
    <section className='relative z-10 px-4 pt-24 pb-16 sm:px-6 md:pt-32 md:pb-24 lg:px-8 lg:pt-36 lg:pb-28'>
      <div className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12'>
        {/* Left Column: Title + Vertical Animated 3-Step Quickstart + CTAs */}
        <div className='flex flex-col items-start text-left lg:col-span-5 xl:col-span-5'>
          {/* Animated Two-Line Typewriter Title */}
          <TypewriterTitle />

          {/* Vertical Animated 3-Step Quickstart Pipeline (自上而下，带有动态流光连接线) */}
          <div
            className='landing-animate-fade-up relative mt-8 w-full max-w-lg opacity-0'
            style={{ animationDelay: '140ms' }}
          >
            {/* Connecting Vertical Track with Flowing Particle Beam */}
            <div className='absolute left-[19px] top-6 bottom-6 w-[2px] overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800'>
              <motion.div
                className='h-16 w-full bg-gradient-to-b from-transparent via-neutral-400 to-transparent dark:via-neutral-500'
                animate={{ y: ['-100%', '320%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Step Items */}
            <div className='space-y-4'>
              {steps.map((step) => (
                <div
                  key={step.num}
                  className='group relative flex items-start gap-3.5 rounded-xl border border-transparent p-2 transition-all hover:border-border/50 hover:bg-card/40'
                >
                  {/* Step Icon Badge */}
                  <div className='relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background shadow-xs ring-4 ring-background transition-transform duration-200 group-hover:scale-105'>
                    {step.icon}
                  </div>

                  {/* Step Content */}
                  <div className='min-w-0 flex-1 pt-0.5'>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-[11px] font-bold text-neutral-800 dark:text-neutral-200'>
                        STEP {step.num}
                      </span>
                      <h3 className='text-sm font-semibold tracking-tight text-foreground'>
                        {step.title}
                      </h3>
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons (Only primary CTA retained per user request) */}
          <div
            className='landing-animate-fade-up mt-8 flex flex-wrap items-center gap-3.5 opacity-0'
            style={{ animationDelay: '200ms' }}
          >
            {props.isAuthenticated ? (
              <Button
                className='group h-12 rounded-xl px-7 text-sm font-semibold shadow-lg shadow-neutral-900/15 dark:shadow-black/40'
                render={<Link to='/dashboard' />}
              >
                {t('Go to Dashboard')}
                <ArrowRight className='ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1' />
              </Button>
            ) : (
              <Button
                className='group h-12 rounded-xl px-7 text-sm font-semibold shadow-lg shadow-neutral-900/15 dark:shadow-black/40'
                render={<Link to='/sign-up' />}
              >
                {t('Get Started Now')}
                <ArrowRight className='ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1' />
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Multi-CLI Showcase (Light & Dark mode adaptive) */}
        <div
          className='landing-animate-fade-up flex w-full justify-center opacity-0 lg:col-span-7 xl:col-span-7 lg:justify-end'
          style={{ animationDelay: '260ms' }}
        >
          <HeroCliShowcase className='mt-6 lg:mt-0' />
        </div>
      </div>
    </section>
  )
}
