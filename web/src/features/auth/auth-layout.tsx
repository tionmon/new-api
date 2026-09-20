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
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { InteractiveGridBackground } from '@/components/interactive-grid-background'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='bg-background text-foreground relative isolate flex min-h-svh w-full flex-col items-center justify-center overflow-x-clip'>
      {/* Interactive Grid Background focused on the central auth card */}
      <InteractiveGridBackground focused />

      {/* Top Left: Logo & Back to Home */}
      <Link
        to='/'
        className='absolute top-4 left-4 z-20 flex items-center gap-2 transition-opacity hover:opacity-80 sm:top-8 sm:left-8'
      >
        <div className='relative h-8 w-8'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='h-8 w-8 rounded-full object-cover'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <h1 className='text-xl font-medium tracking-tight'>{systemName}</h1>
        )}
      </Link>

      {/* Top Right: Language and Theme switches */}
      <div className='absolute top-4 right-4 z-20 flex items-center gap-2 sm:top-8 sm:right-8'>
        <LanguageSwitcher />
        <ThemeSwitch />
      </div>

      {/* Central Focused Auth Card */}
      <div className='relative z-10 container flex min-h-svh items-center justify-center py-16 sm:py-12'>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className='border-border/70 bg-card/85 dark:bg-card/40 mx-auto flex w-full flex-col justify-center rounded-3xl border p-6 shadow-2xl shadow-black/[0.04] backdrop-blur-xl sm:w-[480px] sm:p-8 dark:border-white/10'
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
