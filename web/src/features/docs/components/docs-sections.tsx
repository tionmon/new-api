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
import {
  ArrowRightLeft,
  Code2,
  Cpu,
  Layers,
  Network,
  Radio,
  Server,
  Terminal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'

interface DocsSectionsProps {
  activeTopic: string
  baseUrl: string
}

export function DocsSections({ activeTopic, baseUrl }: DocsSectionsProps) {
  const { t } = useTranslation()
  const [sdkTab, setSdkTab] = useState<'python' | 'node' | 'curl'>('curl')

  // Render content based on active topic
  switch (activeTopic) {
    case 'overview':
    case 'api-specs':
    case 'first-request':
      return (
        <div className='space-y-10'>
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline' className='font-mono text-xs'>
                OpenAI Standard
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Core Specifications')}
              </Badge>
            </div>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl text-foreground'>
              {t('Unified API Specification & Quickstart')}
            </h1>
            <p className='mt-2 text-sm md:text-base text-muted-foreground leading-relaxed'>
              {t(
                'Adheres to standard OpenAI API specifications. Switch Base URL and API Key to connect any client, Agent, or framework to 40+ AI providers.'
              )}
            </p>
          </div>

          {/* Quick specs cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='rounded-xl border border-border/80 bg-card/60 p-4 space-y-2'>
              <div className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'>
                <Server className='size-3.5 text-foreground' />
                {t('Unified Base URL')}
              </div>
              <div className='flex items-center justify-between rounded-md bg-muted/40 p-2.5 font-mono text-xs text-foreground'>
                <span className='truncate'>{baseUrl}/v1</span>
                <CopyButton
                  value={`${baseUrl}/v1`}
                  size='sm'
                  className='h-6 w-6'
                />
              </div>
              <p className='text-[11px] text-muted-foreground'>
                {t(
                  'All OpenAI-compatible SDKs and developer tools point to this endpoint'
                )}
              </p>
            </div>

            <div className='rounded-xl border border-border/80 bg-card/60 p-4 space-y-2'>
              <div className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'>
                <Cpu className='size-3.5 text-foreground' />
                {t('Authentication Specification')}
              </div>
              <div className='flex items-center justify-between rounded-md bg-muted/40 p-2.5 font-mono text-xs text-foreground'>
                <span className='truncate'>Authorization: Bearer sk-...</span>
                <CopyButton
                  value='Authorization: Bearer sk-...'
                  size='sm'
                  className='h-6 w-6'
                />
              </div>
              <p className='text-[11px] text-muted-foreground'>
                {t(
                  'Create personal access tokens in the Token Management console'
                )}
              </p>
            </div>
          </div>

          {/* Code snippet tabs */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                <Terminal className='size-4' />
                {t('Send Your First Request in 30 Seconds')}
              </h2>
              <div className='flex rounded-lg border border-border/60 p-0.5 bg-muted/30 text-xs'>
                <button
                  type='button'
                  onClick={() => setSdkTab('curl')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sdkTab === 'curl'
                      ? 'bg-background text-foreground shadow-xs font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  cURL
                </button>
                <button
                  type='button'
                  onClick={() => setSdkTab('python')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sdkTab === 'python'
                      ? 'bg-background text-foreground shadow-xs font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Python
                </button>
                <button
                  type='button'
                  onClick={() => setSdkTab('node')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sdkTab === 'node'
                      ? 'bg-background text-foreground shadow-xs font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            <div className='relative rounded-xl border border-border bg-neutral-950 p-4 font-mono text-xs text-neutral-200 shadow-inner overflow-x-auto'>
              {sdkTab === 'curl' && (
                <>
                  <div className='absolute right-3 top-3'>
                    <CopyButton
                      value={`curl -X POST "${baseUrl}/v1/chat/completions" \\\n  -H "Authorization: Bearer sk-your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-4o-mini",\n    "messages": [{"role": "user", "content": "Hello, AI!"}],\n    "temperature": 0.7\n  }'`}
                      variant='ghost'
                      size='sm'
                      className='h-7 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    />
                  </div>
                  <pre className='text-emerald-400'>
{`curl -X POST "${baseUrl}/v1/chat/completions" \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello, AI!"}],
    "temperature": 0.7
  }'`}
                  </pre>
                </>
              )}

              {sdkTab === 'python' && (
                <>
                  <div className='absolute right-3 top-3'>
                    <CopyButton
                      value={`from openai import OpenAI\n\nclient = OpenAI(\n    base_url="${baseUrl}/v1",\n    api_key="sk-your-api-key"\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role": "user", "content": "Hello world!"}]\n)\n\nprint(response.choices[0].message.content)`}
                      variant='ghost'
                      size='sm'
                      className='h-7 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    />
                  </div>
                  <pre className='text-emerald-400'>
{`from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}/v1",
    api_key="sk-your-api-key"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello world!"}]
)

print(response.choices[0].message.content)`}
                  </pre>
                </>
              )}

              {sdkTab === 'node' && (
                <>
                  <div className='absolute right-3 top-3'>
                    <CopyButton
                      value={`import OpenAI from 'openai';\n\nconst openai = new OpenAI({\n  baseURL: '${baseUrl}/v1',\n  apiKey: 'sk-your-api-key',\n});\n\nasync function main() {\n  const completion = await openai.chat.completions.create({\n    messages: [{ role: 'user', content: 'Hello world!' }],\n    model: 'gpt-4o-mini',\n  });\n  console.log(completion.choices[0].message.content);\n}\n\nmain();`}
                      variant='ghost'
                      size='sm'
                      className='h-7 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    />
                  </div>
                  <pre className='text-emerald-400'>
{`import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: '${baseUrl}/v1',
  apiKey: 'sk-your-api-key',
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello world!' }],
    model: 'gpt-4o-mini',
  });
  console.log(completion.choices[0].message.content);
}

main();`}
                  </pre>
                </>
              )}
            </div>
          </div>

          {/* Endpoints Table */}
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold text-foreground flex items-center gap-2'>
              <Layers className='size-4' />
              {t('Standard Endpoint Mapping')}
            </h2>
            <div className='overflow-x-auto rounded-lg border border-border/80'>
              <table className='w-full text-left text-xs'>
                <thead className='border-b border-border/80 bg-muted/40 font-medium text-foreground'>
                  <tr>
                    <th className='px-4 py-2.5'>{t('Endpoint')}</th>
                    <th className='px-4 py-2.5'>{t('Method')}</th>
                    <th className='px-4 py-2.5'>{t('Supported Features')}</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60 text-muted-foreground'>
                  <tr>
                    <td className='px-4 py-2.5 font-mono text-foreground font-medium'>
                      /v1/chat/completions
                    </td>
                    <td className='px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400'>
                      POST
                    </td>
                    <td className='px-4 py-2.5'>
                      {t(
                        'Streaming SSE, Tool Calling, Structured Outputs, Vision Understanding'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-2.5 font-mono text-foreground font-medium'>
                      /v1/models
                    </td>
                    <td className='px-4 py-2.5 font-mono text-blue-600 dark:text-blue-400'>
                      GET
                    </td>
                    <td className='px-4 py-2.5'>
                      {t('Retrieve accessible model list and permissions')}
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-2.5 font-mono text-foreground font-medium'>
                      /v1/embeddings
                    </td>
                    <td className='px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400'>
                      POST
                    </td>
                    <td className='px-4 py-2.5'>
                      {t('Vector text embeddings for RAG retrieval')}
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-2.5 font-mono text-foreground font-medium'>
                      /v1/images/generations
                    </td>
                    <td className='px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400'>
                      POST
                    </td>
                    <td className='px-4 py-2.5'>
                      {t('Image generation and multi-resolution drawing')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )

    case 'claude-code':
    case 'cursor-setup':
    case 'aider-setup':
    case 'sdks':
      return (
        <div className='space-y-10'>
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline' className='font-mono text-xs'>
                Ecosystem
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Tool Integrations')}
              </Badge>
            </div>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl text-foreground'>
              {t('Developer Tools & Client Setup')}
            </h1>
            <p className='mt-2 text-sm md:text-base text-muted-foreground leading-relaxed'>
              {t(
                'Connect Cursor, Claude Code, Aider, and other productivity tools to the gateway in 10 seconds.'
              )}
            </p>
          </div>

          {/* Cursor Guide */}
          <div className='rounded-xl border border-border/80 bg-card/40 p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base font-semibold text-foreground flex items-center gap-2'>
                <Code2 className='size-4 text-foreground' />
                Cursor IDE 配置
              </h2>
              <Badge variant='outline' className='text-xs font-mono'>
                IDE
              </Badge>
            </div>
            <ol className='list-decimal list-inside text-xs text-muted-foreground space-y-2 leading-relaxed'>
              <li>
                {t('Open Cursor Settings -> Models -> OpenAI API Key')}
              </li>
              <li>
                {t('Enable Override OpenAI Base URL and enter:')}
                <span className='font-mono font-bold text-foreground mx-1'>
                  {baseUrl}/v1
                </span>
              </li>
              <li>
                {t(
                  'Enter your API Key created on this platform and click Verify to activate.'
                )}
              </li>
            </ol>
          </div>

          {/* Claude Code Guide */}
          <div className='rounded-xl border border-border/80 bg-card/40 p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base font-semibold text-foreground flex items-center gap-2'>
                <Terminal className='size-4 text-foreground' />
                Claude Code 终端接入
              </h2>
              <Badge variant='outline' className='text-xs font-mono'>
                CLI
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              {t(
                'Before launching Claude Code in your terminal, set the Anthropic endpoint override:'
              )}
            </p>
            <div className='relative rounded-lg border border-border bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200'>
              <div className='absolute right-2 top-2'>
                <CopyButton
                  value={`export ANTHROPIC_BASE_URL="${baseUrl}"\nexport ANTHROPIC_API_KEY="sk-your-api-key"`}
                  variant='ghost'
                  size='sm'
                  className='h-7 text-neutral-300 hover:text-white hover:bg-neutral-800'
                />
              </div>
              <pre className='text-emerald-400'>
{`export ANTHROPIC_BASE_URL="${baseUrl}"
export ANTHROPIC_API_KEY="sk-your-api-key"`}
              </pre>
            </div>
          </div>

          {/* Aider Pair Programming */}
          <div className='rounded-xl border border-border/80 bg-card/40 p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base font-semibold text-foreground flex items-center gap-2'>
                <ArrowRightLeft className='size-4 text-foreground' />
                Aider 终端结对编程
              </h2>
              <Badge variant='outline' className='text-xs font-mono'>
                Git CLI
              </Badge>
            </div>
            <div className='relative rounded-lg border border-border bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200'>
              <div className='absolute right-2 top-2'>
                <CopyButton
                  value={`aider --openai-api-base "${baseUrl}/v1" --openai-api-key "sk-your-api-key" --model gpt-4o`}
                  variant='ghost'
                  size='sm'
                  className='h-7 text-neutral-300 hover:text-white hover:bg-neutral-800'
                />
              </div>
              <code className='text-emerald-400 break-all'>
                aider --openai-api-base "{baseUrl}/v1" --openai-api-key "sk-your-api-key" --model gpt-4o
              </code>
            </div>
          </div>
        </div>
      )

    case 'failover':
    case 'load-balance':
      return (
        <div className='space-y-10'>
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline' className='font-mono text-xs'>
                High Availability
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Smart Gateway')}
              </Badge>
            </div>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl text-foreground'>
              {t('Smart Routing & Instant Failover Engine')}
            </h1>
            <p className='mt-2 text-sm md:text-base text-muted-foreground leading-relaxed'>
              {t(
                'Built-in health probes and circuit breaker self-healing. When an upstream provider encounters timeouts or errors, requests route to backup channels in microseconds.'
              )}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='rounded-xl border border-border/80 bg-card/40 p-5 space-y-3'>
              <div className='flex items-center gap-2 text-foreground font-semibold text-sm'>
                <Network className='size-4 text-emerald-500' />
                {t('Weighted Round-Robin Load Balancing')}
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                {t(
                  'Distribute load across multiple upstream channels with custom weight ratios, preventing single-channel rate limits.'
                )}
              </p>
            </div>

            <div className='rounded-xl border border-border/80 bg-card/40 p-5 space-y-3'>
              <div className='flex items-center gap-2 text-foreground font-semibold text-sm'>
                <Radio className='size-4 text-emerald-500' />
                {t('Automated Fault Isolation & Self-Healing')}
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                {t(
                  'Temporarily isolates failing channels and runs health probes to smoothly recover traffic once upstream stabilizes.'
                )}
              </p>
            </div>
          </div>
        </div>
      )

    case 'common-errors':
    case 'connection-test':
    default:
      return (
        <div className='space-y-10'>
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <Badge variant='outline' className='font-mono text-xs'>
                Troubleshooting
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Troubleshooting')}
              </Badge>
            </div>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl text-foreground'>
              {t('Troubleshooting & HTTP Status Codes')}
            </h1>
            <p className='mt-2 text-sm md:text-base text-muted-foreground leading-relaxed'>
              {t(
                'Identify root causes quickly based on HTTP status codes:'
              )}
            </p>
          </div>

          <div className='space-y-4'>
            <div className='rounded-xl border border-border/80 bg-card/40 p-4 space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-amber-600 dark:text-amber-400'
                >
                  401 Unauthorized
                </Badge>
                <span className='text-sm font-semibold text-foreground'>
                  {t('Invalid API Key or Insufficient Quota')}
                </span>
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                {t(
                  'Check Authorization token validity and ensure remaining quota is sufficient in the console.'
                )}
              </p>
            </div>

            <div className='rounded-xl border border-border/80 bg-card/40 p-4 space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-amber-600 dark:text-amber-400'
                >
                  403 Forbidden
                </Badge>
                <span className='text-sm font-semibold text-foreground'>
                  {t('Group Permission Denied')}
                </span>
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                {t(
                  'The current user group is not authorized for this model. Adjust group settings in Token Management.'
                )}
              </p>
            </div>

            <div className='rounded-xl border border-border/80 bg-card/40 p-4 space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-blue-600 dark:text-blue-400'
                >
                  429 Too Many Requests
                </Badge>
                <span className='text-sm font-semibold text-foreground'>
                  {t('Rate Limit Exceeded')}
                </span>
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                {t(
                  'Reached RPM or TPM quota limits. Please smooth out request frequency.'
                )}
              </p>
            </div>

            <div className='rounded-xl border border-border/80 bg-card/40 p-4 space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-red-600 dark:text-red-400'
                >
                  500 / 502 / 504
                </Badge>
                <span className='text-sm font-semibold text-foreground'>
                  {t('Upstream Provider Error')}
                </span>
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                {t(
                  'Upstream provider outage. The gateway automatically triggers failover; check channel logs in console if persistent.'
                )}
              </p>
            </div>
          </div>
        </div>
      )
  }
}
