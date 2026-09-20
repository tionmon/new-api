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
import { List, MoveUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface DocsTocProps {
  activeTopicId: string
  className?: string
}

export function DocsToc({ activeTopicId, className }: DocsTocProps) {
  const { t } = useTranslation()

  // Dynamic headings based on active topic
  const getHeadings = () => {
    switch (activeTopicId) {
      case 'codex-script':
        return [
          { id: 'builder', title: t('Interactive Command Generator') },
          { id: 'pipeline', title: t('Script Execution Pipeline') },
          { id: 'params', title: t('CLI Parameter Matrix') },
          { id: 'manual', title: t('Manual Setup Reference') },
        ]
      case 'overview':
      case 'api-specs':
      case 'first-request':
        return [
          { id: 'specs', title: t('Base Endpoint & Auth') },
          { id: 'verify', title: t('30s First Request Verification') },
          { id: 'endpoints', title: t('Standard Protocol Endpoints') },
        ]
      case 'claude-code':
      case 'cursor-setup':
      case 'aider-setup':
      case 'sdks':
        return [
          { id: 'cursor', title: 'Cursor IDE' },
          { id: 'claude', title: 'Claude Code CLI' },
          { id: 'aider', title: 'Aider' },
        ]
      default:
        return [
          { id: 'overview', title: t('Core Architecture Overview') },
          { id: 'details', title: t('Technical Specifications') },
        ]
    }
  }

  const headings = getHeadings()

  return (
    <aside
      className={cn(
        'w-56 shrink-0 hidden xl:block sticky top-16 h-[calc(100vh-4rem)] p-6 pl-4 border-l border-border/60 text-xs',
        className
      )}
    >
      <div className='text-foreground mb-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase opacity-75'>
        <List className='size-3.5' />
        {t('On This Page')}
      </div>

      <nav className='border-border/60 space-y-2 border-l pl-3'>
        {headings.map((item) => (
          <div
            key={item.id}
            className='text-muted-foreground hover:text-foreground cursor-default transition-colors select-none'
          >
            {item.title}
          </div>
        ))}
      </nav>

      <div className='border-border/60 text-muted-foreground mt-8 space-y-2 border-t pt-4 text-[11px]'>
        <a
          href='https://github.com/QuantumNous/new-api'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-foreground flex items-center gap-1 transition-colors'
        >
          <span>{t('Suggest edits on GitHub')}</span>
          <MoveUpRight className='size-3' />
        </a>
      </div>
    </aside>
  )
}
