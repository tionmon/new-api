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
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GatewayFlowVisualizer } from '../gateway-flow-visualizer'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'Smart Multi-Route Failover • Always Connected':
          '多线路自动容灾 • 稳定不掉线',
        'Multi-Account Smart Failover: Seamless AI Requests That Never Drop':
          '多账号智能容灾：保障请求稳定不掉线',
        'Simulate Failure': '模拟故障',
        'Multiple Upstream Channels Running Concurrently':
          '多条上游并发运行',
        '1. Your Apps & Tools': '1. 你的应用与工具',
        'API Smart Routing Hub': 'API 智能路由中枢',
        'Multi-Account Upstream Pool': '上游多账号与容灾池',
        'Microsoft Azure Cloud': '微软云 Azure',
        'Smooth & Connected': '绿色畅通 • 极速传输',
        'Cutoff': '线路切断',
        'Active': '在线运行',
      }
      return dict[key] ?? key
    },
  }),
}))

describe('GatewayFlowVisualizer', () => {
  it('renders solutions section with 4 parallel accounts (GPT Pro 20X 01/02/03 + Azure)', () => {
    const { container } = render(<GatewayFlowVisualizer />)

    // Section anchor id
    const section = container.querySelector('#solutions')
    expect(section).toBeInTheDocument()

    // Title and stages
    expect(
      screen.getByText('多账号智能容灾：保障请求稳定不掉线')
    ).toBeInTheDocument()
    expect(screen.getByText('1. 你的应用与工具')).toBeInTheDocument()
    expect(screen.getByText('API 智能路由中枢')).toBeInTheDocument()
    expect(screen.getByText('上游多账号与容灾池')).toBeInTheDocument()

    // 4 explicit active upstream accounts
    expect(screen.getByText('GPT Pro 20X - 01')).toBeInTheDocument()
    expect(screen.getByText('GPT Pro 20X - 02')).toBeInTheDocument()
    expect(screen.getByText('GPT Pro 20X - 03')).toBeInTheDocument()
    expect(screen.getByText('微软云 Azure')).toBeInTheDocument()

    // Ensure ephemeral/specific model names like gpt-4o are not hardcoded
    expect(screen.queryByText(/gpt-4o/i)).not.toBeInTheDocument()
  })

  it('toggles failover simulation smoothly without changing UI card layout', () => {
    render(<GatewayFlowVisualizer />)

    const button = screen.getByRole('button', {
      name: /模拟故障/i,
    })
    expect(button).toBeInTheDocument()

    // Initially, all 4 accounts show Active
    expect(screen.getAllByText('在线运行').length).toBe(4)

    // Click to simulate failure
    fireEvent.click(button)

    // Button text remains steady (zero layout jump)
    expect(button).toHaveTextContent('模拟故障')

    // Only line 01 indicator updates to Cutoff, while the other 3 accounts remain Active
    expect(screen.getByText('线路切断')).toBeInTheDocument()
    expect(screen.getAllByText('在线运行').length).toBe(3)

    // All 4 accounts remain intact in DOM without UI layout fragmentation
    expect(screen.getByText('GPT Pro 20X - 01')).toBeInTheDocument()
    expect(screen.getByText('GPT Pro 20X - 02')).toBeInTheDocument()
    expect(screen.getByText('GPT Pro 20X - 03')).toBeInTheDocument()
    expect(screen.getByText('微软云 Azure')).toBeInTheDocument()

    // Click again to restore
    fireEvent.click(button)
    expect(screen.getAllByText('在线运行').length).toBe(4)
  })
})
