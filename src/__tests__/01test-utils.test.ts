/** Tests for test utilities
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
import { makeCustomComp, makeSimpleComp, testComp } from './test-utils'
import { test, expect } from '@playwright/test'

test('makeSimpleComp', async () => {
  const comp = makeSimpleComp(['A','B','C'])
  expect( await comp(['A','B']) ).toStrictEqual(1)
  expect( await comp(['A','C']) ).toStrictEqual(1)
  expect( await comp(['B','A']) ).toStrictEqual(0)
  expect( await comp(['B','C']) ).toStrictEqual(1)
  expect( await comp(['C','A']) ).toStrictEqual(0)
  expect( await comp(['C','B']) ).toStrictEqual(0)
})

test('makeCustomComp', async () => {
  const comp = makeCustomComp({'A\0B':0,'A\0C':1,'B\0C':0})
  expect( await comp(['A','B']) ).toStrictEqual(0)
  expect( await comp(['B','A']) ).toStrictEqual(1)
  expect( await comp(['A','C']) ).toStrictEqual(1)
  expect( await comp(['C','A']) ).toStrictEqual(0)
  expect( await comp(['B','C']) ).toStrictEqual(0)
  expect( await comp(['C','B']) ).toStrictEqual(1)
})

// Copied from https://github.com/haukex/merge-insertion.js/blob/37f490a3/src/__tests__/merge-insertion.test.ts#L241
test('testComp', async () => {
  const log :[string,string][] = []
  const c = testComp(async _ab=>0, 2, log)
  await c(['x','y'])
  await c(['x','z'])
  await expect( c(['x','x']) ).rejects.toThrow('may not be equal')
  await expect( c(['y','x']) ).rejects.toThrow('duplicate comparison')
  await expect( c(['x','y']) ).rejects.toThrow('duplicate comparison')
  await expect( c(['x','z']) ).rejects.toThrow('duplicate comparison')
  await expect( c(['i','j']) ).rejects.toThrow('too many')
  expect(log).toStrictEqual([['x','y'],['x','z']])
})