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
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { assert, expect, test } from 'vitest'

import { GroupRatioVisualEditor } from '../group-ratio-visual-editor'

function PricingFixture({
  initial = {
    GroupRatio: '{"default":1}',
    TopupGroupRatio: '{}',
    UserUsableGroups: '{}',
    GroupOrder: '[]',
  },
}: {
  initial?: Record<string, string>
}) {
  const [settings, setSettings] = useState<Record<string, string>>(initial)
  return (
    <>
      <GroupRatioVisualEditor
        section='pricing'
        onSectionChange={() => {}}
        defaultUseAutoGroupField={null}
        groupRatio={settings.GroupRatio}
        topupGroupRatio={settings.TopupGroupRatio}
        userUsableGroups={settings.UserUsableGroups}
        groupOrder={settings.GroupOrder}
        groupGroupRatio='{}'
        autoGroups='[]'
        maxTokenAutoGroupsField={null}
        groupSpecialUsableGroup='{}'
        onChange={(field, value) =>
          setSettings((current) => ({ ...current, [field]: value }))
        }
      />
      <output aria-label='Saved ratios'>{JSON.stringify(settings)}</output>
    </>
  )
}

function savedSettings() {
  return JSON.parse(
    screen.getByRole('status', { name: 'Saved ratios' }).textContent ?? '{}'
  )
}

function dataRow(index: number) {
  // Row 0 is the header row.
  return screen.getAllByRole('row')[index + 1]
}

const twoGroups = {
  GroupRatio: '{"a":1,"b":1}',
  TopupGroupRatio: '{}',
  UserUsableGroups: '{}',
  GroupOrder: '[]',
}

test('renders groups in the saved display order', () => {
  render(<PricingFixture initial={{ ...twoGroups, GroupOrder: '["b","a"]' }} />)

  expect(within(dataRow(0)).getByDisplayValue('b')).toBeTruthy()
  expect(within(dataRow(1)).getByDisplayValue('a')).toBeTruthy()
})

test('moving a group up reorders the rows and saves the display order', async () => {
  const user = userEvent.setup()
  render(<PricingFixture initial={twoGroups} />)

  // Row buttons are ordered: move up, move down, details, delete.
  await user.click(within(dataRow(1)).getAllByRole('button')[0])

  expect(within(dataRow(0)).getByDisplayValue('b')).toBeTruthy()
  expect(JSON.parse(savedSettings().GroupOrder)).toEqual(['b', 'a'])
})

test('a group added later follows the ordered groups', () => {
  render(
    <PricingFixture
      initial={{
        GroupRatio: '{"a":1,"b":2}',
        TopupGroupRatio: '{}',
        UserUsableGroups: '{"newcomer":"latest"}',
        GroupOrder: '["b"]',
      }}
    />
  )

  expect(within(dataRow(0)).getByDisplayValue('b')).toBeTruthy()
  expect(within(dataRow(1)).getByDisplayValue('a')).toBeTruthy()
  expect(within(dataRow(2)).getByDisplayValue('newcomer')).toBeTruthy()
})

test.each([
  ['GroupRatio', 0],
  ['TopupGroupRatio', 1],
] as const)(
  '%s preserves typed decimals and accepts them as valid numeric ratios',
  async (key, index) => {
    const user = userEvent.setup()
    render(<PricingFixture />)
    const row = screen.getByDisplayValue('default').closest('tr')
    assert(row)
    const input = within(row).getAllByRole('spinbutton')[
      index
    ] as HTMLInputElement
    fireEvent.change(input, { target: { value: '0.0' } })
    expect(input.value).toBe('0.0')
    await user.clear(input)
    await user.type(input, '0.04')
    expect(input).toHaveValue(0.04)
    await user.tab()
    expect(input.checkValidity()).toBe(true)
    const saved = savedSettings()
    expect(JSON.parse(saved[key])).toEqual({ default: 0.04 })
    await user.clear(input)
    await user.type(input, '0.0001')
    expect(input).toHaveValue(0.0001)
    expect(input.checkValidity()).toBe(true)
    await user.clear(input)
    await user.type(input, '0.00001')
    expect(input.validity.stepMismatch).toBe(true)
    await user.clear(input)
    await user.type(input, '-0.04')
    expect(input.validity.rangeUnderflow).toBe(true)
  }
)
