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
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const customDocsLink =
    typeof status?.docs_link === 'string' && status.docs_link.trim().length > 0
      ? status.docs_link.trim()
      : undefined

  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='relative z-10 overflow-hidden px-6 py-20 md:py-32'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView
          animation='scale-in'
          className='relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/50 p-8 text-center shadow-2xl md:p-14 dark:from-neutral-900/90 dark:to-neutral-950/90'
        >
          {/* Ambient Glows */}
          <div
            aria-hidden
            className='pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-96 -translate-x-1/2 rounded-full bg-neutral-400/10 blur-3xl dark:bg-white/5'
          />
          <div
            aria-hidden
            className='pointer-events-none absolute -bottom-24 right-10 -z-10 h-64 w-72 rounded-full bg-neutral-400/10 blur-3xl dark:bg-white/5'
          />

          <h2 className='text-3xl font-extrabold tracking-tight md:text-5xl text-foreground'>
            {t('Ready to Supercharge Your')}
            <br />
            <span className='bg-gradient-to-b from-neutral-950 via-neutral-700 to-neutral-500 bg-clip-text text-transparent dark:from-white dark:via-neutral-200 dark:to-neutral-400'>
              {t('AI Application Architecture?')}
            </span>
          </h2>

          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base'>
            {t(
              'Join thousands of developers and teams leveraging New API for high-availability LLM routing, enterprise security, and unified billing.'
            )}
          </p>

          {/* Action buttons */}
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3.5'>
            <Button
              className='group h-11 rounded-lg px-6 text-sm font-medium shadow-lg shadow-primary/25'
              render={<Link to='/sign-up' />}
            >
              {t('Get Started Immediately')}
              <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
            {customDocsLink &&
            customDocsLink !== 'https://docs.newapi.pro' &&
            !customDocsLink.startsWith('/') ? (
              <Button
                variant='outline'
                className='border-border/60 hover:border-border hover:bg-muted/50 h-11 rounded-lg px-5 text-sm font-medium'
                render={
                  <a
                    href={customDocsLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                }
              >
                <BookOpen className='mr-1.5 size-4 text-muted-foreground' />
                {t('Read Architecture Docs')}
              </Button>
            ) : (
              <Button
                variant='outline'
                className='border-border/60 hover:border-border hover:bg-muted/50 h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/docs' />}
              >
                <BookOpen className='mr-1.5 size-4 text-muted-foreground' />
                {t('Read Architecture Docs')}
              </Button>
            )}
          </div>

          {/* Feature checklist under CTA */}
          <div className='mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-border/40 pt-6 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <CheckCircle className='size-3.5 text-emerald-500' />
              <span>{t('Single-Binary SQLite Deployment')}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <CheckCircle className='size-3.5 text-emerald-500' />
              <span>{t('Zero Upstream Vendor Lock-in')}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <CheckCircle className='size-3.5 text-emerald-500' />
              <span>{t('100% Free & Open Source')}</span>
            </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
