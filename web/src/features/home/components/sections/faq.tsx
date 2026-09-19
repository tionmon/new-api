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
import { useTranslation } from 'react-i18next'
import { HelpCircle } from 'lucide-react'

import { AnimateInView } from '@/components/animate-in-view'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

interface FAQProps {
  isStandalone?: boolean
}

export function FAQ({ isStandalone }: FAQProps = {}) {
  const { t } = useTranslation()

  const faqs = [
    {
      q: t('What is New API and what problems does it solve?'),
      a: t(
        'New API is a high-concurrency, enterprise-grade AI gateway proxy written in Go. It aggregates leading AI model vendors (OpenAI, Claude, Gemini, DeepSeek, Azure, AWS Bedrock, etc.) behind a single unified OpenAI-compatible endpoint, providing multi-channel load balancing, automatic failover, real-time token billing, and user group management.'
      ),
    },
    {
      q: t('How do I integrate New API with my existing AI applications?'),
      a: t(
        'Because New API follows the standard OpenAI API specification, you only need to update the baseURL (e.g. https://your-domain.com/v1) and replace the apiKey in your application or SDK (like Cursor, Cherry Studio, LangChain, or official OpenAI SDKs). No code rewrites are necessary.'
      ),
    },
    {
      q: t('How does automatic channel failover and load balancing work?'),
      a: t(
        'You can configure multiple channels for the same model (e.g. official OpenAI, Azure OpenAI, and custom third-party relays). New API intelligently balances load across them and automatically retries alternate healthy channels within milliseconds if an upstream channel encounters rate limits, network timeouts, or server errors.'
      ),
    },
    {
      q: t('How are billing rates and token quotas calculated?'),
      a: t(
        'New API features a centralized, overflow-safe quota engine with tiered billing expressions. You can set individual pricing for input tokens, completion tokens, prompt caching, and custom task durations. Quota pre-deduction and settlement ensure users never exceed their balances.'
      ),
    },
    {
      q: t('Can I deploy New API with zero external dependencies?'),
      a: t(
        'Yes! New API natively supports built-in SQLite, enabling single-binary zero-setup deployment (go run main.go or docker run). For high-concurrency enterprise clusters, it seamlessly connects to MySQL, PostgreSQL, ClickHouse, and Redis.'
      ),
    },
    {
      q: t('How does New API protect data security and privacy?'),
      a: t(
        'New API acts as a transparent, stream-first gateway. It adheres to OWASP ASVS authentication standards, supports WebAuthn/Passkeys, 2FA, IP whitelists, and granular personal access tokens. Prompts and completions are streamed directly without persistent storage unless log auditing is explicitly enabled.'
      ),
    },
  ]

  return (
    <section
      className={`relative z-10 px-6 ${
        isStandalone
          ? 'pt-28 pb-24 md:pt-36 md:pb-32'
          : 'border-t border-border/40 bg-muted/5 py-20 md:py-28'
      }`}
    >
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <AnimateInView className='mb-12 text-center'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 shadow-xs'>
            <HelpCircle className='size-3.5 text-neutral-600 dark:text-neutral-400' />
            <span>{t('Frequently Asked Questions')}</span>
          </div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground md:text-3xl'>
            {t('Everything You Need to Know')}
          </h2>
          <p className='mx-auto mt-2 max-w-xl text-sm text-muted-foreground/80 md:text-base'>
            {t(
              'Common questions about integration, multi-channel routing, deployment, and security.'
            )}
          </p>
        </AnimateInView>

        {/* Accordion */}
        <AnimateInView animation='fade-up' className='rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xs shadow-xs dark:bg-card/30'>
          <Accordion className='divide-y divide-border/40'>
            {faqs.map((faq, idx) => (
              <AccordionItem key={faq.q} value={`item-${idx}`} className='py-2 first:pt-0 last:pb-0'>
                <AccordionTrigger className='text-base font-medium hover:no-underline py-3 text-foreground hover:text-foreground/75 transition-colors'>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className='text-sm text-muted-foreground leading-relaxed pt-1 pb-3'>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimateInView>
      </div>
    </section>
  )
}
