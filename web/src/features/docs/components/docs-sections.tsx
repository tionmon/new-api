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
import { useState } from 'react'
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
            <div className='mb-3 flex items-center gap-2'>
              <Badge variant='outline' className='font-mono text-xs'>
                OpenAI Standard
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Core Specifications')}
              </Badge>
            </div>
            <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
              {t('Unified API Specification & Quickstart')}
            </h1>
            <p className='text-muted-foreground mt-2 text-sm leading-relaxed md:text-base'>
              {t(
                'Adheres to standard OpenAI API specifications. Switch Base URL and API Key to connect any client, Agent, or framework to 40+ AI providers.'
              )}
            </p>
          </div>

          {/* Quick specs cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='border-border/80 bg-card/60 space-y-2 rounded-xl border p-4'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                <Server className='text-foreground size-3.5' />
                {t('Unified Base URL')}
              </div>
              <div className='bg-muted/40 text-foreground flex items-center justify-between rounded-md p-2.5 font-mono text-xs'>
                <span className='truncate'>{baseUrl}/v1</span>
                <CopyButton
                  value={`${baseUrl}/v1`}
                  size='sm'
                  className='h-6 w-6'
                />
              </div>
              <p className='text-muted-foreground text-[11px]'>
                {t(
                  'All OpenAI-compatible SDKs and developer tools point to this endpoint'
                )}
              </p>
            </div>

            <div className='border-border/80 bg-card/60 space-y-2 rounded-xl border p-4'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                <Cpu className='text-foreground size-3.5' />
                {t('Authentication Specification')}
              </div>
              <div className='bg-muted/40 text-foreground flex items-center justify-between rounded-md p-2.5 font-mono text-xs'>
                <span className='truncate'>Authorization: Bearer sk-...</span>
                <CopyButton
                  value='Authorization: Bearer sk-...'
                  size='sm'
                  className='h-6 w-6'
                />
              </div>
              <p className='text-muted-foreground text-[11px]'>
                {t(
                  'Create personal access tokens in the Token Management console'
                )}
              </p>
            </div>
          </div>

          {/* Code snippet tabs */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-foreground flex items-center gap-2 text-lg font-semibold'>
                <Terminal className='size-4' />
                {t('Send Your First Request in 30 Seconds')}
              </h2>
              <div className='border-border/60 bg-muted/30 flex rounded-lg border p-0.5 text-xs'>
                <button
                  type='button'
                  onClick={() => setSdkTab('curl')}
                  className={`rounded-md px-3 py-1 transition-colors ${
                    sdkTab === 'curl'
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  cURL
                </button>
                <button
                  type='button'
                  onClick={() => setSdkTab('python')}
                  className={`rounded-md px-3 py-1 transition-colors ${
                    sdkTab === 'python'
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Python
                </button>
                <button
                  type='button'
                  onClick={() => setSdkTab('node')}
                  className={`rounded-md px-3 py-1 transition-colors ${
                    sdkTab === 'node'
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            <div className='border-border relative overflow-x-auto rounded-xl border bg-neutral-950 p-4 font-mono text-xs text-neutral-200 shadow-inner'>
              {sdkTab === 'curl' && (
                <>
                  <div className='absolute top-3 right-3'>
                    <CopyButton
                      value={`curl -X POST "${baseUrl}/v1/chat/completions" \\\n  -H "Authorization: Bearer sk-your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-4o-mini",\n    "messages": [{"role": "user", "content": "Hello, AI!"}],\n    "temperature": 0.7\n  }'`}
                      variant='ghost'
                      size='sm'
                      className='h-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
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
                  <div className='absolute top-3 right-3'>
                    <CopyButton
                      value={`from openai import OpenAI\n\nclient = OpenAI(\n    base_url="${baseUrl}/v1",\n    api_key="sk-your-api-key"\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role": "user", "content": "Hello world!"}]\n)\n\nprint(response.choices[0].message.content)`}
                      variant='ghost'
                      size='sm'
                      className='h-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
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
                  <div className='absolute top-3 right-3'>
                    <CopyButton
                      value={`import OpenAI from 'openai';\n\nconst openai = new OpenAI({\n  baseURL: '${baseUrl}/v1',\n  apiKey: 'sk-your-api-key',\n});\n\nasync function main() {\n  const completion = await openai.chat.completions.create({\n    messages: [{ role: 'user', content: 'Hello world!' }],\n    model: 'gpt-4o-mini',\n  });\n  console.log(completion.choices[0].message.content);\n}\n\nmain();`}
                      variant='ghost'
                      size='sm'
                      className='h-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
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
            <h2 className='text-foreground flex items-center gap-2 text-lg font-semibold'>
              <Layers className='size-4' />
              {t('Standard Endpoint Mapping')}
            </h2>
            <div className='border-border/80 overflow-x-auto rounded-lg border'>
              <table className='w-full text-left text-xs'>
                <thead className='border-border/80 bg-muted/40 text-foreground border-b font-medium'>
                  <tr>
                    <th className='px-4 py-2.5'>{t('Endpoint')}</th>
                    <th className='px-4 py-2.5'>{t('Method')}</th>
                    <th className='px-4 py-2.5'>{t('Supported Features')}</th>
                  </tr>
                </thead>
                <tbody className='divide-border/60 text-muted-foreground divide-y'>
                  <tr>
                    <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
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
                    <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
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
                    <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
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
                    <td className='text-foreground px-4 py-2.5 font-mono font-medium'>
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
            <div className='mb-3 flex items-center gap-2'>
              <Badge variant='outline' className='font-mono text-xs'>
                Ecosystem
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Tool Integrations')}
              </Badge>
            </div>
            <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
              {t('Developer Tools & Client Setup')}
            </h1>
            <p className='text-muted-foreground mt-2 text-sm leading-relaxed md:text-base'>
              {t(
                'Connect Cursor, Claude Code, Aider, and other productivity tools to the gateway in 10 seconds.'
              )}
            </p>
          </div>

          {/* Cursor Guide */}
          <div className='border-border/80 bg-card/40 space-y-3.5 rounded-xl border p-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-foreground flex items-center gap-2 text-base font-semibold'>
                <Code2 className='text-foreground size-4' />
                Cursor IDE 配置
              </h2>
              <Badge variant='outline' className='font-mono text-xs'>
                IDE
              </Badge>
            </div>
            <ol className='text-muted-foreground list-inside list-decimal space-y-2 text-xs leading-relaxed'>
              <li>{t('Open Cursor Settings -> Models -> OpenAI API Key')}</li>
              <li>
                {t('Enable Override OpenAI Base URL and enter:')}
                <span className='text-foreground mx-1 font-mono font-bold'>
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
          <div className='border-border/80 bg-card/40 space-y-3.5 rounded-xl border p-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-foreground flex items-center gap-2 text-base font-semibold'>
                <Terminal className='text-foreground size-4' />
                Claude Code 终端接入
              </h2>
              <Badge variant='outline' className='font-mono text-xs'>
                CLI
              </Badge>
            </div>
            <p className='text-muted-foreground text-xs'>
              {t(
                'Before launching Claude Code in your terminal, set the Anthropic endpoint override:'
              )}
            </p>
            <div className='border-border relative rounded-lg border bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200'>
              <div className='absolute top-2 right-2'>
                <CopyButton
                  value={`export ANTHROPIC_BASE_URL="${baseUrl}"\nexport ANTHROPIC_API_KEY="sk-your-api-key"`}
                  variant='ghost'
                  size='sm'
                  className='h-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                />
              </div>
              <pre className='text-emerald-400'>
                {`export ANTHROPIC_BASE_URL="${baseUrl}"
export ANTHROPIC_API_KEY="sk-your-api-key"`}
              </pre>
            </div>
          </div>

          {/* Aider Pair Programming */}
          <div className='border-border/80 bg-card/40 space-y-3.5 rounded-xl border p-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-foreground flex items-center gap-2 text-base font-semibold'>
                <ArrowRightLeft className='text-foreground size-4' />
                Aider 终端结对编程
              </h2>
              <Badge variant='outline' className='font-mono text-xs'>
                Git CLI
              </Badge>
            </div>
            <div className='border-border relative rounded-lg border bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200'>
              <div className='absolute top-2 right-2'>
                <CopyButton
                  value={`aider --openai-api-base "${baseUrl}/v1" --openai-api-key "sk-your-api-key" --model gpt-4o`}
                  variant='ghost'
                  size='sm'
                  className='h-7 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                />
              </div>
              <code className='break-all text-emerald-400'>
                aider --openai-api-base "{baseUrl}/v1" --openai-api-key
                "sk-your-api-key" --model gpt-4o
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
            <div className='mb-3 flex items-center gap-2'>
              <Badge variant='outline' className='font-mono text-xs'>
                High Availability
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Smart Gateway')}
              </Badge>
            </div>
            <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
              {t('Smart Routing & Instant Failover Engine')}
            </h1>
            <p className='text-muted-foreground mt-2 text-sm leading-relaxed md:text-base'>
              {t(
                'Built-in health probes and circuit breaker self-healing. When an upstream provider encounters timeouts or errors, requests route to backup channels in microseconds.'
              )}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='border-border/80 bg-card/40 space-y-3 rounded-xl border p-5'>
              <div className='text-foreground flex items-center gap-2 text-sm font-semibold'>
                <Network className='size-4 text-emerald-500' />
                {t('Weighted Round-Robin Load Balancing')}
              </div>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {t(
                  'Distribute load across multiple upstream channels with custom weight ratios, preventing single-channel rate limits.'
                )}
              </p>
            </div>

            <div className='border-border/80 bg-card/40 space-y-3 rounded-xl border p-5'>
              <div className='text-foreground flex items-center gap-2 text-sm font-semibold'>
                <Radio className='size-4 text-emerald-500' />
                {t('Automated Fault Isolation & Self-Healing')}
              </div>
              <p className='text-muted-foreground text-xs leading-relaxed'>
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
            <div className='mb-3 flex items-center gap-2'>
              <Badge variant='outline' className='font-mono text-xs'>
                Troubleshooting
              </Badge>
              <Badge className='bg-foreground text-background text-xs'>
                {t('Troubleshooting')}
              </Badge>
            </div>
            <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
              {t('Troubleshooting & HTTP Status Codes')}
            </h1>
            <p className='text-muted-foreground mt-2 text-sm leading-relaxed md:text-base'>
              {t('Identify root causes quickly based on HTTP status codes:')}
            </p>
          </div>

          <div className='space-y-4'>
            <div className='border-border/80 bg-card/40 space-y-2 rounded-xl border p-4'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-amber-600 dark:text-amber-400'
                >
                  401 Unauthorized
                </Badge>
                <span className='text-foreground text-sm font-semibold'>
                  {t('Invalid API Key or Insufficient Quota')}
                </span>
              </div>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {t(
                  'Check Authorization token validity and ensure remaining quota is sufficient in the console.'
                )}
              </p>
            </div>

            <div className='border-border/80 bg-card/40 space-y-2 rounded-xl border p-4'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-amber-600 dark:text-amber-400'
                >
                  403 Forbidden
                </Badge>
                <span className='text-foreground text-sm font-semibold'>
                  {t('Group Permission Denied')}
                </span>
              </div>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {t(
                  'The current user group is not authorized for this model. Adjust group settings in Token Management.'
                )}
              </p>
            </div>

            <div className='border-border/80 bg-card/40 space-y-2 rounded-xl border p-4'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-blue-600 dark:text-blue-400'
                >
                  429 Too Many Requests
                </Badge>
                <span className='text-foreground text-sm font-semibold'>
                  {t('Rate Limit Exceeded')}
                </span>
              </div>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {t(
                  'Reached RPM or TPM quota limits. Please smooth out request frequency.'
                )}
              </p>
            </div>

            <div className='border-border/80 bg-card/40 space-y-2 rounded-xl border p-4'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='font-mono text-red-600 dark:text-red-400'
                >
                  500 / 502 / 504
                </Badge>
                <span className='text-foreground text-sm font-semibold'>
                  {t('Upstream Provider Error')}
                </span>
              </div>
              <p className='text-muted-foreground text-xs leading-relaxed'>
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
