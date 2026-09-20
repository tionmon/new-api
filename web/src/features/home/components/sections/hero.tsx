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
import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { InteractiveGridBackground } from '@/components/interactive-grid-background'
import { LegalLinks } from '@/components/layout/components/footer'
import { Button } from '@/components/ui/button'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

/**
 * Upper band: the four promises the site already makes in its own copy —
 * 简单操作 / 即刻AI (SIMPLE), 稳定不掉线 (STABLE), 极速流式传输 (FAST), and
 * 全模型统一透明计费 (FAIR). Kept to four short words so a cropped row still
 * reads as a mantra; longer or more numerous words would scroll past as
 * fragments and would repeat the subtitle underneath.
 */
const SLOGAN_BAND = ['SIMPLE', 'STABLE', 'FAST', 'FAIR'] as const

/**
 * Lower band: brands the station routes today, in the order users recognise
 * them. Mirrors the live `/api/pricing` roster: ChatGPT (Pro 20x), Gemini
 * (Gemini Ultra), Claude (Claude Pro), and DeepSeek / GLM / Kimi / Qwen (国模
 * groups). Update this list when a group goes on or off sale.
 */
const BRAND_BAND = [
  'CHATGPT',
  'GEMINI',
  'CLAUDE',
  'DEEPSEEK',
  'GLM',
  'KIMI',
  'QWEN',
] as const

/** Vertical nudge for the type layer's upper group (promise line, wordmark,
 *  right-edge spine), in viewport units so it keeps its proportion as the
 *  window resizes. The roster line and the footer are the low anchors the
 *  group moves toward and do NOT shift; the copy stack is centred on the
 *  viewport separately and is not affected. */
const HERO_UPPER_SHIFT = 'translate-y-[6vh]'

const SERVICE_STATUS_URL = 'https://status.bbql.de'

const ARROW_CLASS =
  'size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'

const PILL_BASE =
  'group min-h-[44px] rounded-full bg-transparent px-6 text-[12px] font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-type)] max-[360px]:px-4'

const PILL_PRIMARY = `${PILL_BASE} bg-[var(--hero-pill-bg)] text-[var(--hero-pill-ink)] hover:bg-[var(--hero-type)] [a]:hover:bg-[var(--hero-type)]`
const PILL_SECONDARY = `${PILL_BASE} border border-[var(--hero-pill-line)] text-[var(--hero-ink)] hover:border-[var(--hero-type)] hover:text-[var(--hero-type)] [a]:hover:bg-transparent [a]:hover:text-[var(--hero-type)]`

/**
 * One line of display type: the words joined by drawn dots, sized and
 * positioned by the caller. Static by design — the reference's hero is four
 * objects placed in the field, not a ticker, and a scrolling lane cannot hold
 * that composition.
 */
function TypeLine({
  words,
  scale,
  outlined = false,
}: {
  words: readonly string[]
  scale: string
  outlined?: boolean
}) {
  const wordClass = cn(
    'font-tech leading-[0.92] font-bold tracking-[-0.02em] uppercase',
    scale,
    outlined ? 'hero-band-outline' : 'text-[var(--hero-type)]'
  )
  // A drawn dot rather than the "·" glyph: the mono stack has no reliable
  // middle dot at display sizes and falls back to a box.
  const dotClass = cn(
    'mx-1.5 size-1.5 shrink-0 rounded-full sm:mx-2.5 sm:size-2.5 lg:size-3',
    outlined ? 'border border-[var(--hero-dot)]' : 'bg-[var(--hero-dot)]'
  )

  return (
    <span className='inline-flex w-max items-center'>
      {words.map((word, i) => (
        <span key={word} className='inline-flex items-center'>
          {i > 0 ? <span aria-hidden='true' className={dotClass} /> : null}
          <span className={wordClass}>{word}</span>
        </span>
      ))}
    </span>
  )
}

/**
 * One object of the type layer, placed by the caller's anchor class. Three
 * transforms live on three elements — the wrapper owns the positioning one, the
 * inner element the breathing one, and the content may keep one of its own (the
 * wordmark's skew) — so no transform overwrites another. Do not collapse this
 * back into fewer elements.
 */
function TypeObject({
  anchor,
  breathe,
  children,
}: {
  anchor: string
  breathe: string
  children: ReactNode
}) {
  return (
    <div className={anchor}>
      <div className={breathe}>{children}</div>
    </div>
  )
}

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  const { footerHtml } = useSystemConfig()

  return (
    <section
      aria-labelledby='hero-title'
      className='relative isolate flex min-h-[max(100svh,32rem)] flex-col overflow-hidden bg-[var(--hero-ground)] text-[var(--hero-ink)]'
    >
      {/* Mounted inside the hero rather than by PublicLayout so the grid is
          painted above this section's near-black canvas instead of behind it. */}
      <InteractiveGridBackground />

      {/* Copy area. The type layer is bounded by THIS box, not the viewport,
          so the bottom row can never collide with the rail however many lines
          the admin's disclaimer happens to wrap to. */}
      <div className='relative flex flex-1 flex-col justify-center pt-12'>
        {/* The type layer, laid out on the reference's four anchors: a giant
          line cropped by both side edges up top, the wordmark stroked and
          skewed dead centre behind the copy, a word set vertically down the
          right edge, and a giant line anchored left and running off the right
          at the bottom. Nothing here scrolls; each line breathes on its own
          slow clock, the way the reference's words do. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none'
        >
          <div className={cn('absolute inset-0', HERO_UPPER_SHIFT)}>
            {/* Centre — the wordmark the copy sits on. */}
            <TypeObject
              anchor='absolute inset-x-0 top-[45%] flex -translate-y-1/2 justify-center'
              breathe='animate-hero-breathe'
            >
              <span className='hero-wordmark font-tech block text-[clamp(3.4rem,8vw,7.6rem)] leading-none font-bold tracking-[-0.02em] uppercase opacity-55 sm:opacity-65'>
                TokenMetro
              </span>
            </TypeObject>

            {/* Top — the promises, wider than the frame so both ends crop. */}
            <TypeObject
              anchor='absolute top-[11%] left-1/2 max-w-none -translate-x-1/2 sm:top-[7%]'
              breathe='animate-hero-breathe'
            >
              <TypeLine
                words={SLOGAN_BAND}
                scale='text-[clamp(2.8rem,9.6vw,9rem)]'
              />
            </TypeObject>

            {/* Right edge — set vertically, reading like a spine. */}
            <TypeObject
              anchor='absolute top-1/2 right-3 hidden -translate-y-1/2 lg:block xl:right-5'
              breathe='animate-hero-breathe-alt'
            >
              <span className='font-tech block text-[clamp(2.2rem,4.4vw,4.2rem)] leading-none font-bold tracking-[-0.01em] text-[var(--hero-type-soft)] uppercase opacity-40 [writing-mode:vertical-rl]'>
                Gateway
              </span>
            </TypeObject>
          </div>

          {/* Bottom — the roster, anchored left and running off the right edge.
            Outside the shifted group above, so it stays where it is. Lifted by
            half a background cell: the grid's visible pitch is 90px (see
            .hexhub-grid-pattern) and the magnetic dots sit on the same 90px
            lattice, so half a cell is a fixed 45px, not a percentage. */}
          <TypeObject
            anchor='absolute bottom-[6%] left-[2%] max-w-none -translate-y-[45px] [@media(max-height:600px)]:translate-y-0'
            breathe='animate-hero-breathe-alt origin-left'
          >
            <TypeLine
              words={BRAND_BAND}
              scale='text-[clamp(1.5rem,4.4vw,4.2rem)]'
              outlined
            />
          </TypeObject>
        </div>
      </div>

      {/* The copy stack is centred against the whole viewport, not against the
          copy area — the area stops at the footer, so centring inside it sits
          slightly high. Absolute, so the footer's height cannot move it. */}
      <div className='absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center px-5 text-center'>
        <span className='animate-hero-enter font-tech text-[9px] leading-none font-bold tracking-[0.14em] uppercase [text-shadow:0_2px_14px_var(--hero-shadow)] sm:text-[10px] sm:tracking-[0.22em]'>
          {t('API GATEWAY · SMART ROUTING · UNIFIED BILLING')}
        </span>

        <h1
          id='hero-title'
          className='animate-hero-enter mt-4 max-w-[15em] text-[clamp(2.1rem,4.6vw,4rem)] leading-[0.98] font-black tracking-[-0.035em] text-balance [--hero-enter-delay:90ms] [text-shadow:0_4px_24px_var(--hero-shadow)]'
        >
          {t('TokenMetro API')}
        </h1>

        <p className='animate-hero-enter mt-4 max-w-[32em] text-[15px] leading-relaxed font-bold text-[var(--hero-ink-soft)] [--hero-enter-delay:170ms] [text-shadow:0_2px_12px_var(--hero-shadow)]'>
          {t('One interface to every AI model.')}
        </p>

        <p className='animate-hero-enter mt-2.5 max-w-[36em] text-[12px] leading-relaxed text-[var(--hero-muted)] [--hero-enter-delay:230ms] [text-shadow:0_2px_12px_var(--hero-shadow)]'>
          {t('Observable · scalable · controllable')}
        </p>

        <div className='animate-hero-enter mt-7 flex flex-wrap items-center justify-center gap-2.5 [--hero-enter-delay:310ms]'>
          <Button
            className={PILL_PRIMARY}
            render={<Link to={isAuthenticated ? '/dashboard' : '/sign-up'} />}
          >
            {isAuthenticated ? t('Go to Dashboard') : t('Create Account')}
            <ArrowUpRight className={ARROW_CLASS} />
          </Button>
          <Button
            className={PILL_SECONDARY}
            render={<Link to={isAuthenticated ? '/keys' : '/sign-in'} />}
          >
            {t('Access API')}
            <ArrowUpRight className={ARROW_CLASS} />
          </Button>
        </div>
      </div>

      {/* Equal side columns keep the disclaimer viewport-centred. On narrow
          screens it stays in normal flow on a separate line. */}
      <div className='relative z-10 pt-3 pb-5 sm:pb-6'>
        <div className='relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 text-[11px] text-[var(--hero-muted)] sm:px-7 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]'>
          <a
            href={SERVICE_STATUS_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 transition-colors duration-200 hover:text-[var(--hero-ink)]'
          >
            <span className='animate-hero-dot size-[5px] rounded-full bg-[var(--hero-type)] shadow-[0_0_0_4px_var(--hero-status-glow)]' />
            {t('Service Status')}
          </a>

          {/* Trusted, admin-configured footer HTML can include site styles. */}
          {footerHtml ? (
            <div
              className='custom-footer order-last w-full min-w-0 text-center break-words lg:order-none lg:col-start-2 lg:row-start-1'
              dangerouslySetInnerHTML={{ __html: footerHtml }}
            />
          ) : null}

          <div className='flex flex-wrap items-center justify-end gap-x-3 gap-y-1 lg:col-start-3 lg:row-start-1'>
            <LegalLinks />
          </div>
        </div>
      </div>
    </section>
  )
}
