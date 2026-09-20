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
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { CTA } from '../cta'

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
        'Just swap the base URL to get started':
          '只需替换 Base URL 即可无缝接入',
        'Ready to Upgrade Your AI Infrastructure?':
          '准备好接入下一代 AI 基础设施了吗？',
        '100% OpenAI Compatible': '100% 官方协议兼容',
        'Multi-Account Disaster Recovery': '多账号智能防掉线',
        'Unified Token Settlement': '全模型统一透明计费',
        'Back to Top': '回到顶端',
        Create: '创建',
        'Sign In': '登录',
        'Go to Dashboard': '前往控制台',
        'Copy base URL': '复制 Base URL',
        'OpenAI SDK Base URL:': 'OpenAI SDK 兼容 Base URL:',
      }
      return translations[key] ?? key
    },
  }),
}))

describe('CTA Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
  })

  it('renders top badge, main title, and endpoint breakdown', () => {
    render(<CTA />)

    expect(
      screen.getByText('只需替换 Base URL 即可无缝接入')
    ).toBeInTheDocument()
    expect(
      screen.getByText('准备好接入下一代 AI 基础设施了吗？')
    ).toBeInTheDocument()
    expect(screen.getByText('https://tokenmetro.com')).toBeInTheDocument()
    expect(screen.getByText('/v1')).toBeInTheDocument()
  })

  it('renders 3 feature guarantee cards', () => {
    render(<CTA />)

    expect(screen.getByText('100% 官方协议兼容')).toBeInTheDocument()
    expect(screen.getByText('多账号智能防掉线')).toBeInTheDocument()
    expect(screen.getByText('全模型统一透明计费')).toBeInTheDocument()
  })

  it('triggers scrollToTop when Back to Top button is clicked', () => {
    render(<CTA />)

    const topButton = screen.getByRole('button', { name: '回到顶端' })
    fireEvent.click(topButton)

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('renders Create and Sign In buttons when not authenticated', () => {
    render(<CTA isAuthenticated={false} />)

    const createBtn = screen.getByRole('button', { name: /创建/ })
    expect(createBtn).toHaveAttribute('href', '/sign-up')

    const signInBtn = screen.getByRole('button', { name: '登录' })
    expect(signInBtn).toHaveAttribute('href', '/sign-in')

    expect(
      screen.queryByRole('button', { name: /前往控制台/ })
    ).not.toBeInTheDocument()
  })

  it('renders Go to Dashboard button when authenticated', () => {
    render(<CTA isAuthenticated />)

    const dashboardBtn = screen.getByRole('button', { name: /前往控制台/ })
    expect(dashboardBtn).toHaveAttribute('href', '/dashboard')

    expect(
      screen.queryByRole('button', { name: /创建/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '登录' })
    ).not.toBeInTheDocument()
  })
})
