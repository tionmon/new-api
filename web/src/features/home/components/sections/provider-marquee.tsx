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
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { getLobeIcon } from '@/lib/lobe-icon'

interface ProviderInfo {
  name: string
  iconName: string
}

const PROVIDERS: ProviderInfo[] = [
  { name: 'OpenAI', iconName: 'OpenAI' },
  { name: 'Anthropic', iconName: 'Claude.Color' },
  { name: 'Google', iconName: 'Gemini.Color' },
  { name: 'DeepSeek', iconName: 'DeepSeek.Color' },
  { name: 'Mistral', iconName: 'Mistral.Color' },
  { name: 'Meta', iconName: 'Meta.Color' },
  { name: 'Groq', iconName: 'Groq' },
  { name: 'Ollama', iconName: 'Ollama' },
  { name: 'Alibaba Cloud', iconName: 'Qwen.Color' },
  { name: 'Moonshot AI', iconName: 'Moonshot.Color' },
  { name: 'Zhipu AI', iconName: 'Zhipu.Color' },
  { name: 'Midjourney', iconName: 'Midjourney' },
]

export function ProviderMarquee() {
  const { t } = useTranslation()

  return (
    <section className='border-border/40 bg-muted/5 relative z-10 border-t py-16 md:py-20'>
      <div className='mx-auto max-w-6xl px-6'>
        {/* Header */}
        <AnimateInView className='mb-10 text-center'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300'>
            <Sparkles className='size-3.5 text-neutral-600 dark:text-neutral-400' />
            <span>{t('Connect Leading Commercial & Open-Source Models')}</span>
          </div>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('Universal Connectivity Across Leading AI Models')}
          </h2>
          <p className='text-muted-foreground/80 mx-auto mt-2 max-w-2xl text-sm md:text-base'>
            {t(
              'Route any prompt to commercial leaders, open-weights titans, and specialized engines through a unified OpenAI-standard contract.'
            )}
          </p>
        </AnimateInView>

        {/* Responsive Grid */}
        <div className='grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
          {PROVIDERS.map((provider, i) => (
            <AnimateInView
              key={provider.name}
              delay={i * 25}
              animation='fade-up'
              className='group border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card dark:bg-card/40 dark:hover:border-primary/40 relative flex flex-col items-center justify-center rounded-xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md'
            >
              <div className='border-border/40 bg-muted/30 group-hover:border-primary/30 group-hover:bg-primary/5 flex size-11 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110'>
                {getLobeIcon(provider.iconName, 26)}
              </div>
              <h3 className='text-foreground group-hover:text-primary mt-3 text-center text-sm font-semibold transition-colors duration-200'>
                {provider.name}
              </h3>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
