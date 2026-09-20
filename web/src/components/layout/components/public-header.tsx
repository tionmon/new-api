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
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'

import logoMarkOnDark from '@/assets/brand/logo-mark-on-dark.png'
import logoMarkOnLight from '@/assets/brand/logo-mark-on-light.png'
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
import { handleServerError } from '@/lib/handle-server-error'
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
  showThemeSwitch?: boolean
  showLanguageSwitcher?: boolean
  logo?: React.ReactNode
  siteName?: string
  homeUrl?: string
  showAuthButtons?: boolean
  showNotifications?: boolean
  className?: string
  /**
   * `transparent` floats the header over a full-bleed hero: no background,
   * no blur, taller bar, edge-to-edge instead of the max-w-7xl container.
   * It is absolute rather than fixed so it scrolls with the page and never
   * overlaps content on short viewports.
   */
  tone?: 'solid' | 'transparent'
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
    tone = 'solid',
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
  const isTransparent = tone === 'transparent'

  // Curate desktop nav links in AWS console layout
  // Exclude dashboard/console from left links since it lives in the AWS right auth cluster
  // No forced "Solutions" item either: its only anchor lived in the home page's
  // GatewayFlowVisualizer, which the single-screen home no longer mounts, and a
  // nav item whose target does not exist does nothing when clicked. If the
  // section comes back, add the anchor before re-adding the item here.
  const desktopLinks = useMemo(() => {
    const base = dynamicLinks.length > 0 ? dynamicLinks : navLinks
    return base.filter(
      (l) =>
        l.href !== '/dashboard' &&
        l.title !== t('Console') &&
        !l.href.startsWith('/faq') &&
        l.title !== t('FAQ') &&
        l.title !== 'FAQ'
    )
  }, [dynamicLinks, navLinks, t])

  // The deployment's configured wordmark is a single SVG that swaps its own
  // artwork on `prefers-color-scheme` — the OS setting, not the app theme — so
  // it is invisible in two of the four combinations. Those known paths are
  // served by a bundled theme pair instead; any other configured URL is used
  // exactly as given.
  const systemLogoIsSingleAsset =
    !systemLogo ||
    systemLogo === '/brand/logo.svg' ||
    systemLogo.startsWith('/brand/logo.svg?') ||
    systemLogo === '/logo.png'

  let logoContent: ReactNode = (
    <HeaderLogo
      src={systemLogoIsSingleAsset ? logoMarkOnLight : systemLogo}
      srcOnDark={systemLogoIsSingleAsset ? logoMarkOnDark : undefined}
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
          void navigate({ to: targetPath })
            .then(() => {
              window.location.hash = hashId
              setTimeout(scrollToTarget, 100)
              setTimeout(scrollToTarget, 300)
              setTimeout(scrollToTarget, 600)
            })
            .catch(handleServerError)
        }
      }
    },
    [navigate, pathname, t]
  )

  return (
    <>
      <header
        className={cn(
          'inset-x-0 top-0 z-50 w-full transition-colors duration-200',
          isTransparent
            ? 'absolute border-b border-transparent bg-transparent'
            : 'fixed border-b border-border/40 bg-background/95 backdrop-blur-md',
          className
        )}
      >
        <div
          className={cn(
            'mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8',
            isTransparent ? 'h-[68px] max-w-none sm:h-[72px]' : 'h-14 max-w-7xl'
          )}
        >
          {/* Brand cluster with the navigation on its right, pinned left. */}
          <div className='flex items-center gap-2 lg:gap-6'>
            <Link
              to={homeUrl}
              aria-label={displaySiteName}
              className='group flex shrink-0 items-center gap-2 select-none'
            >
              <div className='flex size-7 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105'>
                {logoContent}
              </div>
            </Link>

            <SystemUpdateAction presentation='version' />

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

          {/* Right section: Lang + Theme + Notify + Auth */}
          <div className='flex items-center gap-3'>
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
                <div className='bg-border/40 hidden h-4 w-px lg:block' />
                <div className='hidden items-center gap-3 lg:flex'>
                  {loading && <Skeleton className='h-8 w-24 rounded-full' />}
                  {!loading && isAuthenticated && (
                    <>
                      <Link
                        to='/dashboard'
                        className='text-foreground/80 hover:text-foreground px-1 py-1 text-xs font-medium transition-colors'
                      >
                        {t('Console')}
                      </Link>
                      <ProfileDropdown />
                    </>
                  )}
                  {!loading && !isAuthenticated && (
                    <Button
                      size='sm'
                      className='bg-foreground text-background [a]:hover:bg-foreground/90 h-8 rounded-full px-4 text-xs font-semibold shadow-xs transition-all'
                      render={<Link to='/dashboard' />}
                    >
                      {t('Console')}
                    </Button>
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
            {desktopLinks.map((link, i) => {
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
                {/* One entry point for both states: /dashboard is behind the
                    auth guard, which sends anonymous visitors to sign-in. */}
                <Link
                  to='/dashboard'
                  onClick={() => setMobileOpen(false)}
                  className='bg-foreground text-background inline-flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80'
                >
                  {t('Console')}
                </Link>
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
