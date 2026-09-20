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
import { ChevronRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
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
      <div className='text-foreground relative min-h-[calc(100vh-4rem)] pt-16'>
        {/* Mobile Header Bar */}
        <div className='border-border/60 bg-background/80 sticky top-16 z-20 flex items-center justify-between border-b px-4 py-2.5 backdrop-blur-md lg:hidden'>
          <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
            <span className='text-foreground font-medium'>{t('Docs')}</span>
            <ChevronRight className='size-3' />
            <span className='max-w-[160px] truncate'>{activeTopicTitle}</span>
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
            className='bg-background/95 fixed inset-0 top-28 z-30 overflow-y-auto p-4 backdrop-blur-md lg:hidden'
            onClick={() => setMobileMenuOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DocsSidebar
                activeTopicId={activeTopicId}
                onSelectTopic={handleSelectTopic}
                className='static h-auto w-full border-none'
              />
            </div>
          </div>
        )}

        {/* Main 3-Column Wiki Container */}
        <div className='mx-auto flex max-w-[1400px] items-start'>
          {/* Left Sidebar (Desktop) */}
          <DocsSidebar
            activeTopicId={activeTopicId}
            onSelectTopic={handleSelectTopic}
            className='hidden lg:flex'
          />

          {/* Center Main Content Area */}
          <main className='max-w-4xl min-w-0 flex-1 px-5 py-8 sm:px-8 md:px-12'>
            {/* Breadcrumb Navigation */}
            <div className='text-muted-foreground mb-6 flex items-center gap-1.5 text-xs font-medium'>
              <span className='hover:text-foreground cursor-pointer'>
                {t('Documentation')}
              </span>
              <ChevronRight className='text-muted-foreground/60 size-3' />
              <span>{activeCategoryTitle}</span>
              <ChevronRight className='text-muted-foreground/60 size-3' />
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
