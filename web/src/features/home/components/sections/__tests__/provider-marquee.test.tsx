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
import { describe, expect, it, vi } from 'vitest'

import { ProviderMarquee } from '../provider-marquee'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'Connect Leading Commercial & Open-Source Models':
          '连接主流商业与开源大模型',
        '40+ Upstream Providers & Model Families':
          '原生聚合 40+ 供应商与模型家族',
      }
      return translations[key] ?? key
    },
  }),
}))

describe('ProviderMarquee', () => {
  it('renders updated badge title without specific provider numbers', () => {
    render(<ProviderMarquee />)

    expect(screen.getByText('连接主流商业与开源大模型')).toBeInTheDocument()
    expect(
      screen.queryByText('原生聚合 40+ 供应商与模型家族')
    ).not.toBeInTheDocument()
  })

  it('renders centered provider names and removes descriptions and tag badges', () => {
    render(<ProviderMarquee />)

    // Provider names should be rendered as headings
    expect(screen.getByRole('heading', { name: 'OpenAI' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Google' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Anthropic' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'DeepSeek' })
    ).toBeInTheDocument()

    // Descriptions and tags should not be present
    expect(
      screen.queryByText('Direct API & Azure OpenAI')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Direct & Azure')).not.toBeInTheDocument()
    expect(screen.queryByText('European AI')).not.toBeInTheDocument()
    expect(screen.queryByText('AI Drawing')).not.toBeInTheDocument()
  })
})
