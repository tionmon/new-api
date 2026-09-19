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
import { ChevronRight, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { DocsCodexScript } from './components/docs-codex-script'
import { DocsSections } from './components/docs-sections'
import { DocsSidebar } from './components/docs-sidebar'
import { DocsToc } from './components/docs-toc'
import { DOCS_CATEGORIES } from './data/docs-content'

export function Docs() {
  const { t, i18n } = useTranslation()
  const { status } = useStatus()
  const isZh = i18n.language.startsWith('zh')

  // Default to codex-script as the featured setup topic
  const [activeTopicId, setActiveTopicId] = useState('codex-script')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Resolve current gateway URL
  const serverAddress = (status?.server_address as string | undefined)?.trim()
  const effectiveBaseUrl =
    serverAddress ||
    (typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://api.your-domain.com')

  // Find active topic & category for breadcrumbs
  let activeCategoryTitle = ''
  let activeTopicTitle = ''

  for (const cat of DOCS_CATEGORIES) {
    const found = cat.topics.find((tp) => tp.id === activeTopicId)
    if (found) {
      activeCategoryTitle = isZh ? cat.titleKey : cat.titleEn
      activeTopicTitle = isZh ? found.titleKey : found.titleEn
      break
    }
  }

  const handleSelectTopic = (id: string) => {
    setActiveTopicId(id)
    setMobileMenuOpen(false)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative min-h-[calc(100vh-4rem)] pt-16 text-foreground'>

        {/* Mobile Header Bar */}
        <div className='lg:hidden flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-16 z-20'>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <span className='font-medium text-foreground'>{t('Docs')}</span>
            <ChevronRight className='size-3' />
            <span className='truncate max-w-[160px]'>{activeTopicTitle}</span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='h-8 w-8 p-0'
          >
            {mobileMenuOpen ? (
              <X className='size-4' />
            ) : (
              <Menu className='size-4' />
            )}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className='lg:hidden fixed inset-0 top-28 z-30 bg-background/95 backdrop-blur-md p-4 overflow-y-auto'
            onClick={() => setMobileMenuOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DocsSidebar
                activeTopicId={activeTopicId}
                onSelectTopic={handleSelectTopic}
                className='w-full border-none h-auto static'
              />
            </div>
          </div>
        )}

        {/* Main 3-Column Wiki Container */}
        <div className='max-w-[1400px] mx-auto flex items-start'>
          {/* Left Sidebar (Desktop) */}
          <DocsSidebar
            activeTopicId={activeTopicId}
            onSelectTopic={handleSelectTopic}
            className='hidden lg:flex'
          />

          {/* Center Main Content Area */}
          <main className='flex-1 min-w-0 px-5 sm:px-8 md:px-12 py-8 max-w-4xl'>
            {/* Breadcrumb Navigation */}
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-6 font-medium'>
              <span className='hover:text-foreground cursor-pointer'>
                {t('Documentation')}
              </span>
              <ChevronRight className='size-3 text-muted-foreground/60' />
              <span>{activeCategoryTitle}</span>
              <ChevronRight className='size-3 text-muted-foreground/60' />
              <span className='text-foreground font-semibold'>
                {activeTopicTitle}
              </span>
            </div>

            {/* Dynamic Content */}
            {activeTopicId === 'codex-script' ? (
              <DocsCodexScript />
            ) : (
              <DocsSections
                activeTopic={activeTopicId}
                baseUrl={effectiveBaseUrl}
              />
            )}
          </main>

          {/* Right Table of Contents (XL screen) */}
          <DocsToc activeTopicId={activeTopicId} />
        </div>
      </div>
    </PublicLayout>
  )
}
