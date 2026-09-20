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
import { Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUp, CheckCircle2, Coins, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()
  const endpointUrl = 'https://tokenmetro.com/v1'
  const baseUrl = 'https://tokenmetro.com'

  const [charCount, setCharCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Realistic typewriter effect: hand-types char-by-char, pauses, then smoothly backspaces and loops
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setCharCount(endpointUrl.length)
      return
    }

    // While user is hovering and the URL is fully typed out, stay paused
    if (isHovered && charCount === endpointUrl.length) {
      return
    }

    let delay = 65
    if (!isDeleting && charCount === endpointUrl.length) {
      delay = 4000
    } else if (isDeleting && charCount === 0) {
      delay = 500
    } else if (isDeleting) {
      delay = 25
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charCount < endpointUrl.length) {
          setCharCount(charCount + 1)
        } else {
          setIsDeleting(true)
        }
      } else {
        if (charCount > 0) {
          setCharCount(charCount - 1)
        } else {
          setIsDeleting(false)
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [charCount, isDeleting, isHovered, endpointUrl.length])

  const typedBase = endpointUrl.slice(0, Math.min(charCount, baseUrl.length))
  const typedPath =
    charCount > baseUrl.length
      ? endpointUrl.slice(baseUrl.length, charCount)
      : ''

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section
      className={cn(
        'relative z-10 overflow-hidden px-6 py-16 md:py-24',
        props.className
      )}
    >
      <div className='mx-auto max-w-4xl'>
        <AnimateInView
          animation='scale-in'
          className='border-border/80 from-card via-card/90 to-card/60 relative overflow-hidden rounded-3xl border bg-gradient-to-b p-6 text-center shadow-xl backdrop-blur-sm md:p-10 dark:from-neutral-900/90 dark:via-neutral-900/60 dark:to-neutral-950/90'
        >
          {/* Ambient Glows */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl'
          />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute right-10 -bottom-24 -z-10 h-64 w-72 rounded-full bg-neutral-400/10 blur-3xl dark:bg-white/5'
          />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)] bg-[size:24px_24px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)]'
          />

          {/* Top Status Header */}
          <div className='inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-100/80 px-3.5 py-1 text-xs font-medium text-neutral-700 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300'>
            <span className='relative flex size-2 shrink-0'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000' />
              <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
            </span>
            <span>{t('Just swap the base URL to get started')}</span>
          </div>

          <h2 className='text-foreground mt-4 text-2xl font-bold tracking-tight sm:text-3xl'>
            {t('Ready to Upgrade Your AI Infrastructure?')}
          </h2>

          {/* Terminal Input Box with Typewriter Animation */}
          <div className='mt-6 flex justify-center'>
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className='group relative flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border border-neutral-200/90 bg-white/70 px-4 py-3 shadow-2xs backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:shadow-md sm:px-5 sm:py-3.5 dark:border-neutral-800/90 dark:bg-neutral-900/70 dark:hover:border-neutral-700'
            >
              {/* Code Endpoint with Hand-Typed Animation */}
              <div className='flex min-w-0 items-center overflow-x-auto font-mono text-sm tracking-tight select-all sm:text-base'>
                <span className='sr-only'>{endpointUrl}</span>
                <span
                  aria-hidden='true'
                  className='text-neutral-500 dark:text-neutral-400'
                >
                  {typedBase}
                </span>
                {typedPath && (
                  <span
                    aria-hidden='true'
                    className='font-semibold text-amber-500 dark:text-amber-400'
                  >
                    {typedPath}
                  </span>
                )}
                <span
                  aria-hidden='true'
                  className={cn(
                    'ml-0.5 inline-block h-4 w-[2px] bg-amber-500 align-middle select-none dark:bg-amber-400 sm:h-5',
                    charCount === endpointUrl.length && !isDeleting
                      ? 'animate-pulse'
                      : 'opacity-100'
                  )}
                />
              </div>

              {/* Copy Button */}
              <div className='flex shrink-0 items-center'>
                <CopyButton
                  value={endpointUrl}
                  variant='ghost'
                  tooltip={t('Copy base URL')}
                  className='size-9 shrink-0 rounded-xl bg-neutral-100 text-neutral-600 shadow-2xs transition-all duration-200 hover:bg-neutral-200 hover:text-neutral-900 active:scale-95 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white'
                  iconClassName='size-4'
                />
              </div>
            </div>
          </div>

          {/* Three Compact Micro Features (占比小一些) */}
          <div className='mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-2.5 text-left sm:grid-cols-3'>
            <div className='border-border/50 bg-card/40 hover:bg-card/70 flex items-start gap-2.5 rounded-xl border p-2.5 backdrop-blur-xs transition-colors sm:p-3'>
              <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
              <div className='min-w-0'>
                <h3 className='text-foreground text-xs font-semibold tracking-tight'>
                  {t('100% OpenAI Compatible')}
                </h3>
                <p className='text-muted-foreground mt-0.5 text-[11px] leading-relaxed'>
                  {t(
                    'Standard OpenAI API format, drop-in replacement for any client without code changes.'
                  )}
                </p>
              </div>
            </div>

            <div className='border-border/50 bg-card/40 hover:bg-card/70 flex items-start gap-2.5 rounded-xl border p-2.5 backdrop-blur-xs transition-colors sm:p-3'>
              <Zap className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='min-w-0'>
                <h3 className='text-foreground text-xs font-semibold tracking-tight'>
                  {t('Multi-Account Disaster Recovery')}
                </h3>
                <p className='text-muted-foreground mt-0.5 text-[11px] leading-relaxed'>
                  {t(
                    'Multi-account concurrent routing with sub-second failover, ensuring 99.99% enterprise SLA.'
                  )}
                </p>
              </div>
            </div>

            <div className='border-border/50 bg-card/40 hover:bg-card/70 flex items-start gap-2.5 rounded-xl border p-2.5 backdrop-blur-xs transition-colors sm:p-3'>
              <Coins className='mt-0.5 size-4 shrink-0 text-indigo-600 dark:text-indigo-400' />
              <div className='min-w-0'>
                <h3 className='text-foreground text-xs font-semibold tracking-tight'>
                  {t('Unified Token Settlement')}
                </h3>
                <p className='text-muted-foreground mt-0.5 text-[11px] leading-relaxed'>
                  {t(
                    'Access GPT, Claude, DeepSeek, and Gemini with clear, pay-as-you-go quota metering.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Scroll to Top + Create / Sign In */}
          <div className='border-border/40 mt-8 flex flex-wrap items-center justify-center gap-3 border-t pt-6'>
            <Button
              variant='outline'
              size='icon'
              onClick={scrollToTop}
              className='group bg-background/80 size-10 rounded-xl border-neutral-200/80 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-100 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/80'
              title={t('Back to Top')}
              aria-label={t('Back to Top')}
            >
              <ArrowUp className='size-4 text-neutral-700 transition-transform duration-200 group-hover:-translate-y-0.5 dark:text-neutral-300' />
            </Button>

            {props.isAuthenticated ? (
              <Button
                className='group h-10 rounded-xl px-6 text-sm font-semibold shadow-lg shadow-neutral-900/15 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] dark:shadow-black/40'
                render={<Link to='/dashboard' />}
              >
                {t('Go to Dashboard')}
                <ArrowRight className='ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1' />
              </Button>
            ) : (
              <>
                <Button
                  className='group h-10 rounded-xl px-6 text-sm font-semibold shadow-lg shadow-neutral-900/15 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] dark:shadow-black/40'
                  render={<Link to='/sign-up' />}
                >
                  {t('Create')}
                  <ArrowRight className='ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1' />
                </Button>
                <Button
                  variant='outline'
                  className='bg-background/80 text-foreground h-10 rounded-xl border-neutral-200/80 px-5 text-sm font-semibold shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-100/80 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80'
                  render={<Link to='/sign-in' />}
                >
                  {t('Sign In')}
                </Button>
              </>
            )}
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
