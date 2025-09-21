/** Tests for Utilities
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
import { test, expect } from '@playwright/test'
import { permutations } from '../utils'

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
