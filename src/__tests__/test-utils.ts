/** Utilities for Tests
 *
 * Copyright © 2025 Hauke D (haukex@zero-g.net)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { Comparable, Comparator } from 'merge-insertion'

export const failComp :Comparator<string> = _ab => { throw new Error('I shouldn\'t be called in this test') }

export function makeSimpleComp(items :string[]) :Comparator<string> {
  return ([a,b]) => Promise.resolve( items.indexOf(a) > items.indexOf(b) ? 0 : 1 )
}

export function makeCustomComp(items :Record<string, 0|1>) :Comparator<string> {
  const m = new Map(Object.entries(items))
  return ab => {
    const swap = ab[0] > ab[1]
    const k = swap ? ab[1]+'\0'+ab[0] : ab[0]+'\0'+ab[1]
    const r = m.get(k)
    if (r!=undefined)
      return Promise.resolve(swap ? (r ? 0 : 1) : r)
    throw new Error(`Unhandled comparison a=${ab[0]} b=${ab[1]}`)
  }
}

// Copied from https://github.com/haukex/merge-insertion.js/blob/37f490a3/src/__tests__/merge-insertion.test.ts#L223
export function testComp<T extends Comparable>(c :Comparator<T>, maxCalls :number, log :[T,T][]|undefined = undefined) :Comparator<T> {
  let callCount = 0
  const pairMap :Map<T, Map<T, null>> = new Map()
  return async ([a,b]) => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    if (a==b) throw new Error(`a and b may not be equal ('${a}')`)
    if (pairMap.get(a)?.has(b) || pairMap.get(b)?.has(a))
      // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
      throw new Error(`duplicate comparison of '${a}' and '${b}'`)
    if (pairMap.has(a)) pairMap.get(a)?.set(b, null)
    else pairMap.set(a, new Map([[b, null]]))
    if (++callCount > maxCalls)
      throw new Error(`too many Comparator calls (${callCount})`)
    if (log!=undefined) log.push([a,b])
    return await c([a,b])
  }
}
