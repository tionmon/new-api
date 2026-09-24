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
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { LayoutProvider, useLayout } from '@/context/layout-provider'

const VARIANT_COOKIE = 'layout_variant'
const COLLAPSIBLE_COOKIE = 'layout_collapsible'

function LayoutProbe() {
  const layout = useLayout()

  return (
    <>
      <output aria-label='Sidebar variant'>{layout.variant}</output>
      <output aria-label='Sidebar collapsible'>{layout.collapsible}</output>
      <button type='button' onClick={() => layout.setVariant('inset')}>
        Use inset
      </button>
      <button type='button' onClick={layout.resetLayout}>
        Reset
      </button>
    </>
  )
}

function LayoutFixture() {
  return (
    <LayoutProvider>
      <LayoutProbe />
    </LayoutProvider>
  )
}

afterEach(() => {
  cleanup()
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0]
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  }
})

describe('layout defaults', () => {
  it('renders the shipped floating sidebar for a first-time visitor', () => {
    render(<LayoutFixture />)

    expect(screen.getByLabelText('Sidebar variant')).toHaveTextContent(
      'floating'
    )
    expect(screen.getByLabelText('Sidebar collapsible')).toHaveTextContent(
      'icon'
    )
  })

  it('restores the floating default when resetting after choosing another variant', async () => {
    document.cookie = `${VARIANT_COOKIE}=inset; path=/`
    document.cookie = `${COLLAPSIBLE_COOKIE}=offcanvas; path=/`
    const user = userEvent.setup()
    render(<LayoutFixture />)

    expect(screen.getByLabelText('Sidebar variant')).toHaveTextContent('inset')

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByLabelText('Sidebar variant')).toHaveTextContent(
      'floating'
    )
    expect(screen.getByLabelText('Sidebar collapsible')).toHaveTextContent(
      'icon'
    )
  })
})
