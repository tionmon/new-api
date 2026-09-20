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
/**
 * Orders group names the way the admin group pricing page arranges them.
 *
 * A name the order does not mention keeps its relative position among the other
 * unmentioned names and follows every mentioned one, so a group added later stays
 * visible at the end until an admin places it.
 */
export function sortByGroupOrder<T>(
  items: T[],
  getGroupName: (item: T) => string,
  groupOrder: readonly string[] | undefined
): T[] {
  // Runs on data straight off the wire, so check the shape instead of trusting the
  // annotation: a JSON string would pass a length check and then fail in forEach.
  if (
    !Array.isArray(groupOrder) ||
    groupOrder.length === 0 ||
    items.length < 2
  ) {
    return items
  }

  const rank = new Map<string, number>()
  groupOrder.forEach((name, index) => {
    if (!rank.has(name)) {
      rank.set(name, index)
    }
  })

  // Unmentioned names all get the last rank: sort() is stable, so they keep their
  // relative position behind every mentioned name.
  const unranked = groupOrder.length

  return [...items].sort(
    (a, b) =>
      (rank.get(getGroupName(a)) ?? unranked) -
      (rank.get(getGroupName(b)) ?? unranked)
  )
}

/** Sorts plain group names, the usual shape of a group list in this app. */
export function sortGroupNames(
  names: string[],
  groupOrder: readonly string[] | undefined
): string[] {
  return sortByGroupOrder(names, (name) => name, groupOrder)
}
