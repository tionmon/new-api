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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Code2, Check } from 'lucide-react'

import { AnimateInView } from '@/components/animate-in-view'
import { CopyButton } from '@/components/copy-button'
import { cn } from '@/lib/utils'

type LanguageKey = 'curl' | 'python' | 'javascript' | 'golang'

interface CodeExample {
  title: string
  lang: string
  code: string
}

export function CodeQuickstart() {
  const { t } = useTranslation()
  const [activeLang, setActiveLang] = useState<LanguageKey>('curl')

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.example.com'

  const examples: Record<LanguageKey, CodeExample> = {
    curl: {
      title: 'cURL',
      lang: 'bash',
      code: `curl ${origin}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-your-new-api-token" \\
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "messages": [{"role": "user", "content": "Hello, New API!"}],
    "stream": true
  }'`,
    },
    python: {
      title: 'Python (OpenAI SDK)',
      lang: 'python',
      code: `from openai import OpenAI

# Simply redirect base_url to your New API instance
client = OpenAI(
    base_url="${origin}/v1",
    api_key="sk-your-new-api-token"
)

response = client.chat.completions.create(
    model="deepseek-r1", # Or gpt-4o, claude-3-7-sonnet, etc.
    messages=[{"role": "user", "content": "Explain quantum computing simply."}],
)
print(response.choices[0].message.content)`,
    },
    javascript: {
      title: 'Node.js / TypeScript',
      lang: 'typescript',
      code: `import OpenAI from 'openai';

// Zero code changes - just configure baseURL
const client = new OpenAI({
  baseURL: '${origin}/v1',
  apiKey: 'sk-your-new-api-token',
});

const stream = await client.chat.completions.create({
  model: 'gemini-2.5-pro',
  messages: [{ role: 'user', content: 'Design a high-scale microservice' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}`,
    },
    golang: {
      title: 'Go',
      lang: 'go',
      code: `package main

import (
	"context"
	"fmt"
	"github.com/sashabaranov/go-openai"
)

func main() {
	config := openai.DefaultConfig("sk-your-new-api-token")
	config.BaseURL = "${origin}/v1" // Drop-in replacement!

	client := openai.NewClientWithConfig(config)
	resp, _ := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-4o",
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleUser, Content: "Hello New API!"},
			},
		},
	)
	fmt.Println(resp.Choices[0].Message.Content)
}`,
    },
  }

  const currentExample = examples[activeLang]

  return (
    <section className='relative z-10 border-t border-border/40 px-6 py-20 md:py-28'>
      <div className='mx-auto max-w-6xl'>
        {/* Section Header */}
        <AnimateInView className='mb-12 text-center'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100/90 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 shadow-xs'>
            <Code2 className='size-3.5 text-neutral-600 dark:text-neutral-400' />
            <span>{t('Instant Drop-in Replacement')}</span>
          </div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground md:text-3xl'>
            {t('Change 1 Line of Code, Access Every Model')}
          </h2>
          <p className='mx-auto mt-3 max-w-2xl text-sm text-muted-foreground/80 md:text-base'>
            {t(
              'Fully compatible with the official OpenAI SDK and ecosystem tools. Switch between OpenAI, Claude, DeepSeek, and Gemini without rewriting your business logic.'
            )}
          </p>
        </AnimateInView>

        {/* Code Showcase Container */}
        <div className='mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-neutral-950 text-neutral-100 shadow-2xl'>
          {/* Top Bar with Language Tabs */}
          <div className='flex flex-wrap items-center justify-between border-b border-neutral-800/80 bg-neutral-900/90 px-4 py-2.5 backdrop-blur-md'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1.5 pr-3 border-r border-neutral-800'>
                <span className='size-2.5 rounded-full bg-red-500/80' />
                <span className='size-2.5 rounded-full bg-amber-500/80' />
                <span className='size-2.5 rounded-full bg-emerald-500/80' />
              </div>
              <div className='flex items-center gap-1 overflow-x-auto'>
                {(['curl', 'python', 'javascript', 'golang'] as const).map((lang) => (
                  <button
                    key={lang}
                    type='button'
                    onClick={() => setActiveLang(lang)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-medium transition-all',
                      activeLang === lang
                        ? 'bg-neutral-800 text-white shadow-xs'
                        : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                    )}
                  >
                    {examples[lang].title}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex items-center gap-3 mt-2 sm:mt-0'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400'>
                <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
                200 OK • 12ms
              </span>
              <CopyButton
                value={currentExample.code}
                className='h-7 w-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              />
            </div>
          </div>

          {/* Code Body */}
          <div className='relative overflow-x-auto p-5 font-mono text-[13px] leading-relaxed select-text'>
            <pre className='text-neutral-200 selection:bg-neutral-700/60'>
              <code>{currentExample.code}</code>
            </pre>
          </div>

          {/* Bottom highlight bar */}
          <div className='flex flex-wrap items-center justify-between border-t border-neutral-800/80 bg-neutral-900/50 px-5 py-3 text-xs text-neutral-400'>
            <div className='flex items-center gap-2'>
              <Check className='size-4 text-emerald-400' />
              <span>{t('Native streaming (SSE) supported across all models')}</span>
            </div>
            <span className='text-[11px] text-neutral-500 font-mono'>
              {origin}/v1
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
