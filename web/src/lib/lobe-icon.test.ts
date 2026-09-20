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
import { toc } from '@lobehub/icons/es/toc'
import { expect, it } from 'vitest'

import { getLobeIconNames } from './lobe-icon'

/**
 * 图标名清单的对外契约。
 *
 * getLobeIconNames 驱动后台的图标选择器，管理员保存的名字会进数据库，所以这份
 * 清单只能增不能丢：名字一旦消失，已配置的模型/厂商图标就会静默退化成首字母圆标。
 *
 * 期望值刻意不复制生成脚本（scripts/gen-lobe-icon-names.mjs）的映射表达式——那样
 * 两边同时写错就互相掩盖了。这里改成两个方向的独立断言，合起来等价于集合相等：
 * 包里的每个图标都在清单里，且清单里没有包和自定义图标之外的东西。
 */
const CUSTOM_ICON_NAMES = ['SGLang', 'Sub2API', 'Wan']

it('keeps every installed icon selectable, with its Color variant where it has one', () => {
  const names = new Set(getLobeIconNames())

  for (const icon of toc) {
    expect(names.has(icon.id)).toBe(true)
    expect(names.has(`${icon.id}.Color`)).toBe(icon.param.hasColor)
  }
})

it('invents no name beyond the installed icons and the custom ones', () => {
  const known = new Set<string>(CUSTOM_ICON_NAMES)
  for (const icon of toc) {
    known.add(icon.id)
    if (icon.param.hasColor) known.add(`${icon.id}.Color`)
  }

  expect(getLobeIconNames().filter((name) => !known.has(name))).toEqual([])
})

it('keeps every custom icon selectable', () => {
  expect(getLobeIconNames()).toEqual(expect.arrayContaining(CUSTOM_ICON_NAMES))
})

it('returns a sorted list without duplicates', () => {
  const names = getLobeIconNames()

  expect(names).toEqual([...names].sort())
  expect(new Set(names).size).toBe(names.length)
})
