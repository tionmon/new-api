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
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import { useSystemConfigStore } from '@/stores/system-config-store'

import type { TopupInfo } from '../../types'
import { RechargeFormCard } from '../recharge-form-card'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { amount: number }) =>
      values ? key.replace('{{amount}}', String(values.amount)) : key,
  }),
}))

const config = useSystemConfigStore.getState().config
const topupInfo: TopupInfo = {
  enable_redemption: true,
  payment_compliance_confirmed: true,
  enable_online_topup: false,
  enable_stripe_topup: false,
  pay_methods: [],
  min_topup: 0,
  stripe_min_topup: 0,
  amount_options: [],
  discount: {},
}

const props = {
  topupInfo,
  redemptionCode: '',
  onRedemptionCodeChange: vi.fn(),
  onRedeem: vi.fn(),
  redeeming: false,
  onOpenBilling: vi.fn(),
}

describe('redemption code purchases', () => {
  beforeEach(() => {
    useSystemConfigStore.setState({ config })
    vi.clearAllMocks()
  })

  afterEach(() => {
    useSystemConfigStore.setState({ config })
  })

  it.each(['USD', 'CNY', 'TOKENS'] as const)(
    'keeps fixed CNY prices and product links when the balance display is %s',
    (quotaDisplayType) => {
      useSystemConfigStore.setState({
        config: {
          ...config,
          currency: { ...config.currency, quotaDisplayType },
        },
      })
      render(<RechargeFormCard {...props} />)

      const products = [
        [5, '360gu5'],
        [20, 'g3cv58'],
        [50, 'szhv1m'],
        [100, '1dlqii'],
      ] as const
      for (const [amount, product] of products) {
        const link = screen.getByRole('link', {
          name: `Buy a ${amount} CNY redemption code`,
        })
        expect(link).toHaveAttribute('href', `https://wzyp.cn/item/${product}`)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(within(link).getByText('¥')).toBeInTheDocument()
      }
    }
  )

  it.each([
    { ...topupInfo, enable_redemption: false },
    { ...topupInfo, payment_compliance_confirmed: false },
    null,
  ])('does not offer purchase or redemption when unavailable: %j', (info) => {
    render(<RechargeFormCard {...props} topupInfo={info} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Order History' })).toBeEnabled()
  })

  it('forwards code changes, redemption and order history actions', () => {
    render(<RechargeFormCard {...props} redemptionCode='CODE' />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Redemption code' }), {
      target: { value: 'NEW-CODE' },
    })
    expect(props.onRedemptionCodeChange).toHaveBeenCalledWith('NEW-CODE')
    fireEvent.click(screen.getByRole('button', { name: 'Redeem' }))
    expect(props.onRedeem).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Order History' }))
    expect(props.onOpenBilling).toHaveBeenCalledOnce()
  })

  it('prevents repeated redemption while processing', () => {
    render(<RechargeFormCard {...props} redemptionCode='CODE' redeeming />)
    fireEvent.click(screen.getByRole('button', { name: 'Redeem' }))
    expect(props.onRedeem).not.toHaveBeenCalled()
  })
})
