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
import { Comparator, compareAllSort } from '../algorithm'
import { mergeInsertionMaxComparisons, mergeInsertionSort } from '../ford-johnson'
import { test, expect } from '@playwright/test'
import { makeSimpleComp } from './test-utils'
import { permutations } from '../utils'

test('mergeInsertionMaxComparisons', async () => {
  // https://oeis.org/A001768 "Sorting numbers: number of comparisons for merge insertion sort of n elements."
  const exp = [0, 1, 3, 5, 7, 10, 13, 16, 19, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66,
    71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141, 146, 151, 156, 161,
    166, 171, 177, 183, 189, 195, 201, 207, 213, 219, 225, 231, 237, 243, 249, 255]
  for (let i=0; i<exp.length; i++)
    expect( mergeInsertionMaxComparisons(i+1) ).toStrictEqual(exp[i])
})

test('mergeInsertionSort-permutations', async () => {
  // 6! = 720, 7! = 5040 - already takes a fair amount of time, so don't increase this!
  for(let listLength=0; listLength<7; listLength++) {
    const array :Readonly<string[]> = Array.from({ length: listLength }, (_, i) => String.fromCharCode(65 + i))
    for (const perm of permutations(array))
      expect( await mergeInsertionSort(perm, ([a,b]) => Promise.resolve(a>b?0:1)) ).toStrictEqual(array)
  }
})

test.fail('mergeInsertionSort-callCount', async () => {
  let callCount = 0
  const baseComp = makeSimpleComp(['A','B','C','D','E'])
  const comp :Comparator = ab => { callCount++; return baseComp(ab) }

  // just for comparison, check the worst-case number of comparisons:
  expect( await compareAllSort(['C','D','B','E','A'], comp) )
    .toStrictEqual([ ['A',0], ['B',1], ['C',2], ['D',3], ['E',4] ])
  expect( callCount ).toStrictEqual(10)  // n!/(k!*(n-k)!) = 10

  expect( await mergeInsertionSort(['C','D','B','E','A'],comp) )
    .toStrictEqual(['A','B','C','D','E'])
  expect( callCount ).toBeLessThanOrEqual(mergeInsertionMaxComparisons(5))
})
