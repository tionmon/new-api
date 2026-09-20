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
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { Hero } from '../hero'

const footerHtml = vi.hoisted(() => ({ value: '' as string }))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string
    children?: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'TokenMetro API': 'TokenMetro API',
        'One interface to every AI model.': '统一的接口，连接全球 AI 模型',
        'Observable · scalable · controllable': '可观测 · 可拓展 · 可控制',
        'Create Account': '创建账户',
        'Go to Dashboard': '前往控制台',
        'Access API': '接入 API',
        'Service Status': '服务状态',
      }
      return translations[key] ?? key
    },
  }),
}))

vi.mock('@/hooks/use-system-config', () => ({
  useSystemConfig: () => ({ footerHtml: footerHtml.value }),
}))

vi.mock('@/components/layout/components/footer', () => ({
  LegalLinks: () => null,
}))

/** CTA hrefs by name, so a renamed link cannot silently pass. */
function hrefOf(name: string) {
  return screen.getByText(name).closest('a')?.getAttribute('href')
}

describe('Hero', () => {
  beforeEach(() => {
    footerHtml.value = ''
  })

  it('sends anonymous visitors to sign-up for the token and sign-in for the key', () => {
    render(<Hero isAuthenticated={false} />)

    expect(hrefOf('创建账户')).toBe('/sign-up')
    expect(hrefOf('接入 API')).toBe('/sign-in')
    expect(screen.queryByText('前往控制台')).toBeNull()
  })

  it('sends signed-in visitors to the console and the key manager', () => {
    render(<Hero isAuthenticated />)

    expect(hrefOf('前往控制台')).toBe('/dashboard')
    expect(hrefOf('接入 API')).toBe('/keys')
    expect(screen.queryByText('创建账户')).toBeNull()
  })

  it('renders the admin disclaimer only when one is configured', () => {
    footerHtml.value = '仅供工作与学习'
    const { unmount } = render(<Hero isAuthenticated={false} />)
    expect(screen.getByText('仅供工作与学习')).toBeInTheDocument()

    unmount()
    footerHtml.value = ''
    render(<Hero isAuthenticated={false} />)
    expect(screen.queryByText('仅供工作与学习')).toBeNull()
    // the empty state must not take the service-status link with it
    expect(screen.getByText('服务状态')).toBeInTheDocument()
  })
})
