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
  // 直接读 DOM：详情面板打开时 base-ui 会给面板外的内容加 aria-hidden，role 查询就
  // 找不到这个 output 了。
  const output = document.querySelector('output[aria-label="Saved ratios"]')
  assert(output)
  return JSON.parse(output.textContent ?? '{}')
}

function savedGroupNames() {
  return Object.keys(JSON.parse(savedSettings().GroupRatio))
}

/** 卡片序 = 保存下来的 GroupRatio 键序，两边应当永远同序。 */
function cardNames() {
  const list = document.querySelector('#group-pricing-order-affordance')
  assert(list)
  return [...list.querySelectorAll('li')].map(
    (item) => item.querySelector('span[title]')?.getAttribute('title') ?? ''
  )
}

function card(name: string) {
  const title = [...document.querySelectorAll('span[title]')].find(
    (element) => element.getAttribute('title') === name
  )
  const item = title?.closest('li')
  assert(item)
  return item
}

const twoGroups = {
  GroupRatio: '{"a":1,"b":1}',
  TopupGroupRatio: '{}',
  UserUsableGroups: '{}',
}

test('renders the cards in GroupRatio key order', () => {
  render(<PricingFixture initial={{ ...twoGroups }} />)

  expect(cardNames()).toEqual(['a', 'b'])
})

test('moving a group up reorders the cards and the saved GroupRatio keys with them', async () => {
  const user = userEvent.setup()
  render(<PricingFixture initial={twoGroups} />)

  await user.click(within(card('b')).getByRole('button', { name: 'Move b up' }))

  expect(cardNames()).toEqual(['b', 'a'])
  expect(savedGroupNames()).toEqual(['b', 'a'])
})

test('a group that only appears in UserUsableGroups follows the ratio groups', () => {
  render(
    <PricingFixture
      initial={{
        GroupRatio: '{"a":1,"b":2}',
        TopupGroupRatio: '{}',
        UserUsableGroups: '{"newcomer":"latest"}',
      }}
    />
  )

  expect(cardNames()).toEqual(['a', 'b', 'newcomer'])
})

test('adding a group names it in the detail sheet and appends it as the last card', async () => {
  const user = userEvent.setup()
  render(<PricingFixture initial={twoGroups} />)

  await user.click(screen.getByRole('button', { name: 'Add group' }))

  const nameInput = screen.getByLabelText('Group name')
  await user.clear(nameInput)
  await user.type(nameInput, 'vip')
  await user.click(screen.getByRole('button', { name: 'Add' }))

  expect(cardNames()).toEqual(['a', 'b', 'vip'])
  expect(savedGroupNames()).toEqual(['a', 'b', 'vip'])
})

test('renaming in the detail sheet renames the card and its ratio key', async () => {
  const user = userEvent.setup()
  render(<PricingFixture initial={twoGroups} />)

  await user.click(within(card('a')).getByRole('button', { name: 'Details' }))

  const nameInput = screen.getByLabelText('Group name')
  expect(nameInput).toHaveValue('a')
  await user.clear(nameInput)
  await user.type(nameInput, 'standard')
  await user.click(screen.getByRole('button', { name: 'Rename' }))

  expect(cardNames()).toEqual(['standard', 'b'])
  expect(savedGroupNames()).toEqual(['standard', 'b'])
})

test('a name another group already uses cannot be committed', async () => {
  const user = userEvent.setup()
  render(<PricingFixture initial={twoGroups} />)

  await user.click(within(card('a')).getByRole('button', { name: 'Details' }))

  const nameInput = screen.getByLabelText('Group name')
  await user.clear(nameInput)
  await user.type(nameInput, 'b')

  expect(screen.getByText('This group name is already in use.')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Rename' })).toBeDisabled()
  expect(cardNames()).toEqual(['a', 'b'])
})

test.each([
  ['GroupRatio', 0],
  ['TopupGroupRatio', 1],
] as const)(
  '%s preserves typed decimals and accepts them as valid numeric ratios',
  async (key, index) => {
    const user = userEvent.setup()
    render(<PricingFixture />)
    const ratioInputs = within(card('default')).getAllByRole('spinbutton')
    const input = ratioInputs[index] as HTMLInputElement
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
