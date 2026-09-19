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
  desc: string
  tag?: string
}

const PROVIDERS: ProviderInfo[] = [
  {
    name: 'OpenAI',
    iconName: 'OpenAI',
    desc: 'Direct API & Azure OpenAI',
    tag: 'Direct & Azure',
  },
  {
    name: 'Anthropic',
    iconName: 'Claude.Color',
    desc: 'Claude Direct & AWS Bedrock',
    tag: 'Direct & Bedrock',
  },
  {
    name: 'Google',
    iconName: 'Gemini.Color',
    desc: 'Google AI & Vertex AI',
    tag: 'Vertex AI & API',
  },
  {
    name: 'DeepSeek',
    iconName: 'DeepSeek.Color',
    desc: 'Full Speed Native & Cloud Clusters',
    tag: 'Native & Cloud',
  },
  {
    name: 'Mistral',
    iconName: 'Mistral.Color',
    desc: 'European AI & Codestral Series',
    tag: 'European AI',
  },
  {
    name: 'Meta',
    iconName: 'Meta.Color',
    desc: 'Llama Open Source Ecosystem',
    tag: 'Open Source',
  },
  {
    name: 'Groq',
    iconName: 'Groq',
    desc: 'LPU Real-time Inference Engine',
    tag: 'Ultra Fast',
  },
  {
    name: 'Ollama',
    iconName: 'Ollama',
    desc: 'Private Self-Hosted Edge Nodes',
    tag: 'Private Edge',
  },
  {
    name: 'Alibaba Cloud',
    iconName: 'Qwen.Color',
    desc: 'Qwen Multilingual Intelligence',
    tag: 'Enterprise',
  },
  {
    name: 'Moonshot AI',
    iconName: 'Moonshot.Color',
    desc: 'Kimi Long Context Processing',
    tag: 'Long Context',
  },
  {
    name: 'Zhipu AI',
    iconName: 'Zhipu.Color',
    desc: 'GLM Multimodal & Reasoning',
    tag: 'Enterprise',
  },
  {
    name: 'Midjourney',
    iconName: 'Midjourney',
    desc: 'Fast Image & Creative Tasks',
    tag: 'AI Drawing',
  },
]

export function ProviderMarquee() {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 border-t border-border/40 bg-muted/5 py-16 md:py-20'>
      <div className='mx-auto max-w-6xl px-6'>
        {/* Header */}
        <AnimateInView className='mb-10 text-center'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300'>
            <Sparkles className='size-3.5 text-neutral-600 dark:text-neutral-400' />
            <span>{t('40+ Upstream Providers & Model Families')}</span>
          </div>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('Universal Connectivity Across Leading AI Models')}
          </h2>
          <p className='mx-auto mt-2 max-w-2xl text-sm text-muted-foreground/80 md:text-base'>
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
              delay={i * 30}
              animation='fade-up'
              className='group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-md dark:bg-card/40'
            >
              <div className='flex items-center justify-between gap-2'>
                <div className='flex size-9 items-center justify-center rounded-lg border border-border/40 bg-muted/30 transition-transform duration-300 group-hover:scale-110'>
                  {getLobeIcon(provider.iconName, 22)}
                </div>
                {provider.tag && (
                  <span className='rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                    {provider.tag}
                  </span>
                )}
              </div>
              <div className='mt-3'>
                <h3 className='text-sm font-semibold text-foreground'>{provider.name}</h3>
                <p className='mt-1 text-xs text-muted-foreground line-clamp-1'>
                  {t(provider.desc)}
                </p>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
