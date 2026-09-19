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
import { useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface CounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
}

function Counter(props: CounterProps) {
  const { end, suffix = '', prefix = '', duration = 1600, decimals = 0 } = props
  const ref = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)

  const formatValue = useCallback(
    (v: number) =>
      decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString(),
    [decimals]
  )

  const animate = useCallback(() => {
    const el = ref.current
    if (!el) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = `${prefix}${formatValue(eased * end)}${suffix}`
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, prefix, suffix, formatValue])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      el.textContent = `${prefix}${formatValue(end)}${suffix}`
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          animate()
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animate, end, prefix, suffix, formatValue])

  return (
    <span ref={ref} className='tabular-nums'>
      {prefix}0{suffix}
    </span>
  )
}

interface StatsProps {
  className?: string
}

export function Stats(_props: StatsProps) {
  const { t } = useTranslation()

  const stats = [
    {
      end: 40,
      suffix: '+',
      label: t('Upstream Providers Aggregated'),
      highlight: t('OpenAI, Claude, Gemini, DeepSeek & more'),
    },
    {
      end: 100,
      suffix: '+',
      label: t('Frontier Models Supported'),
      highlight: t('Text, Vision, Reasoning, Image, Voice'),
    },
    {
      end: 5,
      prefix: '< ',
      suffix: 'ms',
      label: t('Core Routing Overhead'),
      highlight: t('Ultra-low latency stream proxy'),
    },
    {
      end: 99.99,
      suffix: '%',
      decimals: 2,
      label: t('High-Availability Uptime'),
      highlight: t('Multi-cluster automated failover'),
    },
  ]

  return (
    <div className='relative z-10 border-y border-border/40 bg-muted/15 py-12 md:py-16'>
      <div className='mx-auto max-w-6xl px-6'>
        <div className='grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8'>
          {stats.map((s) => (
            <div
              key={s.label}
              className='flex flex-col items-center text-center p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xs transition-all duration-300 hover:border-primary/30'
            >
              <span className='bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl'>
                <Counter
                  end={s.end}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals}
                />
              </span>
              <span className='mt-2 text-sm font-semibold text-foreground'>
                {s.label}
              </span>
              <span className='mt-1 text-xs text-muted-foreground line-clamp-1'>
                {s.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
