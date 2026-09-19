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
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SystemUpdateAction } from '@/features/system-update/system-update-action'
import { useNotifications } from '@/hooks/use-notifications'
import { useSystemConfig } from '@/hooks/use-system-config'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

import { defaultTopNavLinks } from '../config/top-nav.config'
import type { TopNavLink } from '../types'
import { HeaderLogo } from './header-logo'

const AUTH_PROMPT_SECONDS = 5

type AuthPromptTarget = {
  title: string
  href: string
}

export interface PublicHeaderProps {
  navLinks?: TopNavLink[]
  mobileLinks?: TopNavLink[]
  navContent?: React.ReactNode
  showThemeSwitch?: boolean
  showLanguageSwitcher?: boolean
  logo?: React.ReactNode
  siteName?: string
  homeUrl?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  showNavigation?: boolean
  showAuthButtons?: boolean
  showNotifications?: boolean
  className?: string
}

export function PublicHeader(props: PublicHeaderProps) {
  const {
    navLinks = defaultTopNavLinks,
    showThemeSwitch = true,
    showLanguageSwitcher = true,
    logo: customLogo,
    siteName: customSiteName,
    homeUrl = '/',
    showAuthButtons = true,
    showNotifications = true,
    className,
  } = props

  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authPromptTarget, setAuthPromptTarget] =
    useState<AuthPromptTarget | null>(null)
  const [authPromptSecondsLeft, setAuthPromptSecondsLeft] =
    useState(AUTH_PROMPT_SECONDS)
  const { auth } = useAuthStore()
  const {
    systemName,
    logo: systemLogo,
    loading,
    logoLoaded,
  } = useSystemConfig()
  const dynamicLinks = useTopNavLinks()
  const notifications = useNotifications()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const user = auth.user
  const isAuthenticated = !!user
  const displaySiteName = customSiteName || systemName

  // Curate desktop nav links in AWS console layout
  // Exclude dashboard/console from left links since it lives in the AWS right auth cluster
  const desktopLinks = useMemo(() => {
    const base = dynamicLinks.length > 0 ? dynamicLinks : navLinks
    const filtered = base.filter(
      (l) =>
        l.href !== '/dashboard' &&
        l.title !== t('Console') &&
        l.href !== '/faq' &&
        !l.href.startsWith('/faq') &&
        l.title !== t('FAQ') &&
        l.title !== 'FAQ'
    )
    // Ensure "Solutions" is included if not already present
    const hasSolutions = filtered.some(
      (l) => l.title === t('Solutions') || l.href === '/#solutions'
    )
    if (!hasSolutions) {
      const insertIndex = filtered.findIndex((l) => l.href === '/pricing')
      const solutionsItem: TopNavLink = {
        title: t('Solutions'),
        href: '/#solutions',
      }
      if (insertIndex >= 0) {
        filtered.splice(insertIndex + 1, 0, solutionsItem)
      } else {
        filtered.push(solutionsItem)
      }
    }

    return filtered
  }, [dynamicLinks, navLinks, t])

  const links = desktopLinks

  let logoContent: ReactNode = (
    <HeaderLogo
      src={systemLogo}
      loading={loading}
      logoLoaded={logoLoaded}
      className='size-full rounded-lg object-contain'
    />
  )
  if (customLogo) logoContent = customLogo
  if (loading) logoContent = <Skeleton className='size-full rounded-lg' />

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!authPromptTarget) return

    const intervalId = window.setInterval(() => {
      setAuthPromptSecondsLeft((seconds) => Math.max(seconds - 1, 0))
    }, 1000)

    const timeoutId = window.setTimeout(() => {
      const redirect = authPromptTarget.href
      setAuthPromptTarget(null)
      navigate({ to: '/sign-in', search: { redirect } })
    }, AUTH_PROMPT_SECONDS * 1000)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [authPromptTarget, navigate])

  const closeAuthPrompt = useCallback(() => {
    setAuthPromptTarget(null)
    setAuthPromptSecondsLeft(AUTH_PROMPT_SECONDS)
  }, [])

  const navigateToSignIn = useCallback(() => {
    const redirect = authPromptTarget?.href || '/'
    setAuthPromptTarget(null)
    navigate({ to: '/sign-in', search: { redirect } })
  }, [authPromptTarget?.href, navigate])

  const handleNavLinkClick = useCallback(
    (
      event: React.MouseEvent<HTMLAnchorElement>,
      link: TopNavLink,
      closeMobile = false
    ) => {
      if (link.disabled) {
        event.preventDefault()
        return
      }

      if (link.requiresAuth) {
        event.preventDefault()
        if (closeMobile) {
          setMobileOpen(false)
        }
        setAuthPromptSecondsLeft(AUTH_PROMPT_SECONDS)
        setAuthPromptTarget({
          title: t(link.title),
          href: link.href,
        })
        return
      }

      if (closeMobile) {
        setMobileOpen(false)
      }

      if (link.href.includes('#')) {
        event.preventDefault()
        const [path, targetHash] = link.href.split('#')
        const targetPath = path || '/'
        const hashId = targetHash || ''

        const scrollToTarget = () => {
          if (!hashId) return
          const element = document.getElementById(hashId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }

        if (pathname === targetPath) {
          scrollToTarget()
          window.history.pushState(null, '', link.href)
        } else {
          navigate({ to: targetPath as any }).then(() => {
            window.location.hash = hashId
            setTimeout(scrollToTarget, 100)
            setTimeout(scrollToTarget, 300)
            setTimeout(scrollToTarget, 600)
          })
        }
      }
    },
    [navigate, pathname, t]
  )

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md transition-colors duration-200',
          className
        )}
      >
        <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          {/* Left section: Logo + AI Gateway + Divider + Navigation links */}
          <div className='flex items-center gap-2 lg:gap-6'>
            <Link
              to={homeUrl}
              className='group flex items-center gap-2 shrink-0 select-none'
            >
              <div className='flex size-7 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105'>
                {logoContent}
              </div>
              <span
                className='text-sm font-bold tracking-tight text-foreground sm:inline-block'
                title={displaySiteName}
              >
                {loading ? <Skeleton className='h-4 w-16' /> : displaySiteName}
              </span>
            </Link>

            <SystemUpdateAction presentation='version' />

            <div className='hidden h-4 w-px bg-border/60 lg:block' />

            {/* Desktop Navigation Links */}
            <nav className='hidden items-center gap-6 lg:flex'>
              {desktopLinks.map((link) => {
                const isActive = pathname === link.href
                if (link.external) {
                  return (
                    <a
                      key={`${link.title}:${link.href}`}
                      href={link.href}
                      title={t(link.title)}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-disabled={link.disabled}
                      tabIndex={link.disabled ? -1 : undefined}
                      onClick={(event) => handleNavLinkClick(event, link)}
                      className={cn(
                        'text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground',
                        link.disabled && 'pointer-events-none opacity-50'
                      )}
                    >
                      {t(link.title)}
                    </a>
                  )
                }
                return (
                  <Link
                    key={`${link.title}:${link.href}`}
                    to={link.href}
                    title={t(link.title)}
                    disabled={link.disabled}
                    onClick={(event) => handleNavLinkClick(event, link)}
                    className={cn(
                      'text-xs font-medium transition-colors duration-150',
                      isActive
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                      link.disabled && 'pointer-events-none opacity-50'
                    )}
                  >
                    {t(link.title)}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right section: Search + Lang + Theme + Notify + Auth (AWS Style) */}
          <div className='flex items-center gap-3'>
            {/* Search Trigger */}
            <Link
              to='/pricing'
              className='hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors sm:flex'
              title={t('Search models & capabilities')}
            >
              <Search className='size-3.5' />
              <span>{t('Search')}</span>
            </Link>

            {showLanguageSwitcher && <LanguageSwitcher />}
            {showThemeSwitch && <ThemeSwitch />}
            {showNotifications && (
              <NotificationPopover
                open={notifications.popoverOpen}
                onOpenChange={notifications.setPopoverOpen}
                unreadCount={notifications.unreadCount}
                activeTab={notifications.activeTab}
                onTabChange={notifications.setActiveTab}
                notice={notifications.notice}
                announcements={notifications.announcements}
                loading={notifications.loading}
              />
            )}

            {showAuthButtons && (
              <>
                <div className='hidden h-4 w-px bg-border/40 lg:block' />
                <div className='hidden items-center gap-3 lg:flex'>
                  {loading ? (
                    <Skeleton className='h-8 w-24 rounded-full' />
                  ) : isAuthenticated ? (
                    <>
                      <Link
                        to='/dashboard'
                        className='text-xs font-medium text-foreground/80 hover:text-foreground transition-colors px-1 py-1'
                      >
                        {t('Console')}
                      </Link>
                      <ProfileDropdown />
                    </>
                  ) : (
                    <>
                      <Link
                        to='/sign-in'
                        className='text-xs font-medium text-foreground/80 hover:text-foreground transition-colors px-1 py-1'
                      >
                        {t('Sign in to Console')}
                      </Link>
                      <Button
                        size='sm'
                        className='h-8 rounded-full bg-foreground text-background hover:bg-foreground/90 px-4 text-xs font-semibold shadow-xs transition-all'
                        render={<Link to='/sign-up' />}
                      >
                        {t('Create Account')}
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Mobile hamburger button */}
            <div className='flex shrink-0 items-center gap-1.5 lg:hidden'>
              {showAuthButtons && !loading && isAuthenticated && (
                <ProfileDropdown />
              )}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8'
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={t('Toggle navigation menu')}
              >
                <div className='relative size-4'>
                  <span
                    className={cn(
                      'absolute inset-x-0 block h-[1.5px] origin-center rounded-full bg-current transition-all duration-300',
                      mobileOpen ? 'top-[7px] rotate-45' : 'top-[3px]'
                    )}
                  />
                  <span
                    className={cn(
                      'absolute inset-x-0 top-[7px] block h-[1.5px] rounded-full bg-current transition-all duration-300',
                      mobileOpen ? 'scale-x-0 opacity-0' : 'opacity-100'
                    )}
                  />
                  <span
                    className={cn(
                      'absolute inset-x-0 block h-[1.5px] origin-center rounded-full bg-current transition-all duration-300',
                      mobileOpen ? 'top-[7px] -rotate-45' : 'top-[11px]'
                    )}
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <div
        className={cn(
          'bg-background/98 fixed inset-0 z-40 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:pointer-events-none lg:hidden',
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      >
        <div className='flex h-full flex-col justify-between px-8 pt-20 pb-10'>
          <nav className='flex flex-col gap-1'>
            {links.map((link, i) => {
              const isActive = pathname === link.href
              const linkClassName = cn(
                'flex items-center gap-3 py-3 text-base font-medium tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                mobileOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0',
                isActive ? 'text-foreground' : 'text-muted-foreground',
                link.disabled && 'pointer-events-none opacity-50'
              )
              const transitionStyle = {
                transitionDelay: mobileOpen ? `${100 + i * 50}ms` : '0ms',
              }
              if (link.external) {
                return (
                  <a
                    key={`${link.title}:${link.href}`}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-disabled={link.disabled}
                    tabIndex={link.disabled ? -1 : undefined}
                    onClick={(event) => handleNavLinkClick(event, link, true)}
                    className={linkClassName}
                    style={transitionStyle}
                  >
                    {t(link.title)}
                  </a>
                )
              }
              return (
                <Link
                  key={`${link.title}:${link.href}`}
                  to={link.href}
                  disabled={link.disabled}
                  onClick={(event) => handleNavLinkClick(event, link, true)}
                  className={linkClassName}
                  style={transitionStyle}
                >
                  {t(link.title)}
                </Link>
              )
            })}
          </nav>

          <div
            className={cn(
              'flex flex-col gap-3 transition-all duration-500',
              mobileOpen
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
            style={{ transitionDelay: mobileOpen ? '250ms' : '0ms' }}
          >
            {showAuthButtons && (
              <div className='flex flex-col gap-2'>
                {isAuthenticated ? (
                  <Link
                    to='/dashboard'
                    onClick={() => setMobileOpen(false)}
                    className='bg-foreground text-background inline-flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80'
                  >
                    {t('Console')}
                  </Link>
                ) : (
                  <>
                    <Link
                      to='/sign-in'
                      onClick={() => setMobileOpen(false)}
                      className='border border-border/60 text-foreground inline-flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-muted/50'
                    >
                      {t('Sign in to Console')}
                    </Link>
                    <Link
                      to='/sign-up'
                      onClick={() => setMobileOpen(false)}
                      className='bg-foreground text-background inline-flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80'
                    >
                      {t('Create Account')}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={!!authPromptTarget}
        onOpenChange={(open) => {
          if (!open) {
            closeAuthPrompt()
          }
        }}
        title={t('Sign in required')}
        description={t('Please sign in to view {{module}}.', {
          module: authPromptTarget?.title || '',
        })}
        contentClassName='sm:max-w-md'
        contentHeight='auto'
        footer={
          <>
            <Button variant='outline' onClick={closeAuthPrompt}>
              {t('Cancel')}
            </Button>
            <Button onClick={navigateToSignIn}>{t('Sign in now')}</Button>
          </>
        }
      >
        <div className='bg-muted/40 text-muted-foreground rounded-lg px-3 py-2 text-sm'>
          {t('Redirecting to sign in in {{seconds}} seconds.', {
            seconds: authPromptSecondsLeft,
          })}
        </div>
      </Dialog>
    </>
  )
}
