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
import { Search, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { DOCS_CATEGORIES, type DocCategory } from '../data/docs-content'

interface DocsSidebarProps {
  activeTopicId: string
  onSelectTopic: (topicId: string) => void
  className?: string
}

export function DocsSidebar({
  activeTopicId,
  onSelectTopic,
  className,
}: DocsSidebarProps) {
  const { t, i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const isZh = i18n.language.startsWith('zh')

  const query = searchQuery.trim().toLowerCase()

  // Filter categories and topics
  const filteredCategories: DocCategory[] = DOCS_CATEGORIES.map((cat) => {
    const matchingTopics = cat.topics.filter((topic) => {
      if (!query) return true
      const title = isZh ? topic.titleKey : topic.titleEn
      return (
        title.toLowerCase().includes(query) ||
        topic.id.toLowerCase().includes(query)
      )
    })
    return {
      ...cat,
      topics: matchingTopics,
    }
  }).filter((cat) => cat.topics.length > 0)

  return (
    <aside
      className={cn(
        'w-64 shrink-0 flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-border/60 bg-background/50 backdrop-blur-xs',
        className
      )}
    >
      {/* Search Filter Header */}
      <div className='p-4 pb-2'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-2.5 left-2.5 size-3.5' />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search docs...')}
            className='bg-muted/30 border-border/70 h-8.5 rounded-lg pr-7 pl-8 text-xs'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5'
            >
              <X className='size-3.5' />
            </button>
          )}
        </div>
      </div>

      {/* Nav Tree */}
      <div className='flex-1 space-y-5 overflow-y-auto px-3 py-2 text-xs'>
        {filteredCategories.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center text-xs'>
            {t('No matching docs found')}
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} className='space-y-1'>
              <div className='text-foreground px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase opacity-75'>
                {isZh ? cat.titleKey : cat.titleEn}
              </div>
              <div className='space-y-0.5'>
                {cat.topics.map((topic) => {
                  const isActive = activeTopicId === topic.id
                  const title = isZh ? topic.titleKey : topic.titleEn
                  return (
                    <button
                      key={topic.id}
                      type='button'
                      onClick={() => onSelectTopic(topic.id)}
                      className={cn(
                        'w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-md transition-colors font-medium',
                        isActive
                          ? 'bg-foreground text-background font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <span className='truncate'>{title}</span>
                      {topic.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-0.5',
                            isActive
                              ? 'bg-background/20 text-background'
                              : 'bg-foreground/10 text-foreground font-semibold'
                          )}
                        >
                          <Sparkles className='size-2.5' />
                          {topic.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
