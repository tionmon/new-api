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
import { describe, expect, it } from 'vitest'

import { sortByGroupOrder } from './group-order'

const byName = (name: string) => name

describe('sortByGroupOrder', () => {
  it('follows the configured order', () => {
    expect(sortByGroupOrder(['a', 'b', 'c'], byName, ['b', 'a', 'c'])).toEqual([
      'b',
      'a',
      'c',
    ])
  })

  it('appends unmentioned names after the mentioned ones, keeping their relative order', () => {
    expect(sortByGroupOrder(['a', 'b', 'd', 'c'], byName, ['c', 'a'])).toEqual([
      'c',
      'a',
      'b',
      'd',
    ])
  })

  it('leaves the list untouched without a configured order', () => {
    const names = ['a', 'b']

    expect(sortByGroupOrder(names, byName, [])).toBe(names)
    expect(sortByGroupOrder(names, byName, undefined)).toBe(names)
  })

  it('ignores order entries that no longer exist', () => {
    expect(sortByGroupOrder(['a', 'b'], byName, ['gone', 'b', 'a'])).toEqual([
      'b',
      'a',
    ])
  })

  // 与 Go 侧 setting/group_order_test.go 的重复项用例一一对应：重复项是最容易
  // 把「未列出者排到末尾」算错的地方（名次若取「去重后的条数」而不是「原数组长度」，
  // 未列出的分组就不再比它们靠后）。
  it('does not let a repeated order entry duplicate names', () => {
    expect(sortByGroupOrder(['b', 'a'], byName, ['a', 'a', 'b'])).toEqual([
      'a',
      'b',
    ])
  })

  it('still leaves unmentioned names last when the order repeats an entry', () => {
    expect(sortByGroupOrder(['z', 'b'], byName, ['x', 'x', 'b'])).toEqual([
      'b',
      'z',
    ])
  })

  it('orders objects by a group name accessor', () => {
    const groups = [
      { value: '福利分组', label: '福利分组' },
      { value: 'auto', label: 'auto' },
    ]

    expect(
      sortByGroupOrder(groups, (group) => group.value, [
        'auto',
        '福利分组',
      ]).map((group) => group.value)
    ).toEqual(['auto', '福利分组'])
  })

  it('does not mutate the input list', () => {
    const names = ['a', 'b']

    sortByGroupOrder(names, byName, ['b', 'a'])

    expect(names).toEqual(['a', 'b'])
  })
})
