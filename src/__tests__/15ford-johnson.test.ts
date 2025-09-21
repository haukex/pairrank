/** Tests for Ford-Johnson Algorithm
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
import { mergeInsertionSort } from '../ford-johnson'
import { test, expect } from '@playwright/test'
import { assert } from '../utils'

/** Non-recursive version of Heap's algorithm
 *
 * https://en.wikipedia.org/wiki/Heap%27s_algorithm
 */
function* permutations<T>(array :Readonly<T[]>): Generator<T[]> {
  const c :number[] = array.map(_=>0)
  const a = Array.from(array)
  yield* [Array.from(a)]
  let i = 1
  while (i < a.length) {
    const ci = c[i]
    assert(ci!=undefined)
    if (ci<i) {
      const ai = a[i]
      assert(ai!=undefined)
      if (i%2===0) {
        const a0 = a[0]
        assert(a0!=undefined);
        [a[0], a[i]] = [ai, a0]
      }
      else {
        const aci = a[ci]
        assert(aci!=undefined);
        [a[ci], a[i]] = [ai, aci]
      }
      yield* [Array.from(a)]
      c[i] = ci+1
      i = 1
    }
    else {
      c[i] = 0
      i++
    }
  }
}

test('permutations', async () => {
  expect( Array.from(permutations([])) ).toStrictEqual([ [] ])
  expect( Array.from(permutations(['A'])) ).toStrictEqual([ ['A'] ])
  expect( Array.from(permutations(['A','B'])) ).toStrictEqual([ ['A','B'],['B','A'] ])
  expect( Array.from(permutations(['A','B','C'])) ).toStrictEqual([
    ['A','B','C'],['B','A','C'],['C','A','B'],['A','C','B'],['B','C','A'],['C','B','A'] ])
  expect( Array.from(permutations(['A','B','C','D'])) ).toStrictEqual([
    ['A','B','C','D'],['B','A','C','D'],['C','A','B','D'],['A','C','B','D'],['B','C','A','D'],['C','B','A','D'],
    ['D','B','A','C'],['B','D','A','C'],['A','D','B','C'],['D','A','B','C'],['B','A','D','C'],['A','B','D','C'],
    ['A','C','D','B'],['C','A','D','B'],['D','A','C','B'],['A','D','C','B'],['C','D','A','B'],['D','C','A','B'],
    ['D','C','B','A'],['C','D','B','A'],['B','D','C','A'],['D','B','C','A'],['C','B','D','A'],['B','C','D','A'] ])
})

test('mergeInsertionSort', async () => {
  // 6! = 720, 7! = 5040 - already takes a fair amount of time, so don't increase this!
  for(let listLength=0; listLength<7; listLength++) {
    const array :Readonly<string[]> = Array.from({ length: listLength }, (_, i) => String.fromCharCode(65 + i))
    for (const perm of permutations(array))
      expect( await mergeInsertionSort(perm, ([a,b]) => Promise.resolve(a>b?0:1)) ).toStrictEqual(array)
  }
})
