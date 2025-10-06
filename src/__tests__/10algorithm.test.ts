/** Tests for Ranking Algorithms
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
import { normalizeScores, findTieGroups, compareAllSort, breakTies, compareAllComparisons, combinations2 } from '../algorithm'
import { failComp, makeCustomComp, makeSimpleComp } from './test-utils'
import { test, expect } from '@playwright/test'
import { Comparator } from 'merge-insertion'

test('normalizeScores', async () => {
  // function doesn't care about the strings, and sorts the array in place, so make a quick helper:
  const norm = (scores :number[]) => {
    const arr :[string, number][] = scores.map(e => ['', e])
    normalizeScores(arr)
    return arr.map(e => e[1])
  }
  expect( norm([]) ).toStrictEqual([])
  expect( norm([0]) ).toStrictEqual([0])
  expect( norm([1]) ).toStrictEqual([0])
  expect( norm([42]) ).toStrictEqual([0])
  expect( norm([0,1]) ).toStrictEqual([0,1])
  expect( norm([0,0]) ).toStrictEqual([0,0])
  expect( norm([5,10]) ).toStrictEqual([0,1])
  expect( norm([5,5]) ).toStrictEqual([0,0])
  expect( norm([0,1,2,3]) ).toStrictEqual([0,1,2,3])
  expect( norm([5,10,15,20]) ).toStrictEqual([0,1,2,3])
  expect( norm([10,10,10,10]) ).toStrictEqual([0,0,0,0])
  expect( norm([5,10,10,15]) ).toStrictEqual([0,1,1,2])
  expect( norm([5,5,10,10]) ).toStrictEqual([0,0,1,1])
  expect( norm([5,5,10,15,15]) ).toStrictEqual([0,0,1,2,2])
  expect( norm([5,10,10,15,20,20,20,25]) ).toStrictEqual([0,1,1,2,3,3,3,4])
  expect( norm([5,5,10,15,15,15,20,25,25]) ).toStrictEqual([0,0,1,2,2,2,3,4,4])
  expect( norm([0,0,1,2,2,2,3,4,4]) ).toStrictEqual([0,0,1,2,2,2,3,4,4])
})

test('scoreGroups', async () => {
  expect( findTieGroups([]) ).toStrictEqual([])
  expect( findTieGroups([['A',1]]) ).toStrictEqual([])
  expect( findTieGroups([['A',1],['B',1]]) ).toStrictEqual([[0,2]])
  expect( findTieGroups([['A',1],['B',1],['C',1]]) ).toStrictEqual([[0,3]])
  expect( findTieGroups([['A',1],['B',2],['C',3],['D',4]]) ).toStrictEqual([])
  expect( findTieGroups([['A',1],['B',2],['C',2],['D',3]]) ).toStrictEqual([[1,3]])
  expect( findTieGroups([['A',1],['B',1],['C',2],['D',2]]) ).toStrictEqual([[0,2],[2,4]])
  expect( findTieGroups([['A',1],['B',1],['C',2],['D',3],['E',3]]) ).toStrictEqual([[0,2],[3,5]])
  expect( findTieGroups([['A',0],['B',0],['C',1],['D',2],['E',2]]) ).toStrictEqual([[0,2],[3,5]])
  expect( findTieGroups([
    ['A',1],['B',2],['C',2],['D',3],['E',4],['F',4],['G',4],['H',5]
  ]) ).toStrictEqual([[1,3],[4,7]])
  expect( findTieGroups([
    ['A',1],['B',2],['C',2],['D',3],['E',4],['F',4],['G',4],['H',4]
  ]) ).toStrictEqual([[1,3],[4,8]])
  expect( findTieGroups([
    ['A',1],['B',2],['C',2],['D',3],['E',4],['F',4],['G',4],['H',5],['I',5],['J',5]
  ]) ).toStrictEqual([[1,3],[4,7],[7,10]])
})

test('combinations2', () => {
  expect( Array.from(combinations2(['A','B'])) ).toStrictEqual([ ['A','B'] ])
  expect( Array.from(combinations2(['A','B','C'])) ).toStrictEqual([
    ['A','B'], ['A','C'], ['B','C'] ])
  expect( Array.from(combinations2(['A','B','C','D'])) ).toStrictEqual([
    ['A','B'], ['A','C'], ['A','D'], ['B','C'], ['B','D'], ['C','D'] ])
  expect( Array.from(combinations2(['A','B','C','D','E'])) ).toStrictEqual([
    ['A','B'], ['A','C'], ['A','D'], ['A','E'], ['B','C'], ['B','D'], ['B','E'], ['C','D'], ['C','E'], ['D','E'] ])
  expect( Array.from(combinations2(['A','B','C','D','E','F'])) ).toStrictEqual([
    ['A','B'], ['A','C'], ['A','D'], ['A','E'], ['A','F'], ['B','C'], ['B','D'], ['B','E'], ['B','F'], ['C','D'],
    ['C','E'], ['C','F'], ['D','E'], ['D','F'], ['E','F'] ])
  expect( Array.from(combinations2(['A','B','C','D','E','F','G'])) ).toStrictEqual([
    ['A','B'], ['A','C'], ['A','D'], ['A','E'], ['A','F'], ['A','G'], ['B','C'], ['B','D'], ['B','E'], ['B','F'],
    ['B','G'], ['C','D'], ['C','E'], ['C','F'], ['C','G'], ['D','E'], ['D','F'], ['D','G'], ['E','F'], ['E','G'], ['F','G'] ])
  expect( Array.from(combinations2(['A','B','C','D','E','F','G','H'])) ).toStrictEqual([
    ['A','B'], ['A','C'], ['A','D'], ['A','E'], ['A','F'], ['A','G'], ['A','H'], ['B','C'], ['B','D'], ['B','E'],
    ['B','F'], ['B','G'], ['B','H'], ['C','D'], ['C','E'], ['C','F'], ['C','G'], ['C','H'], ['D','E'], ['D','F'],
    ['D','G'], ['D','H'], ['E','F'], ['E','G'], ['E','H'], ['F','G'], ['F','H'], ['G','H'] ])
})

test('compareAllComparisons', () => {
  // <https://oeis.org/A161680>: a(n) = binomial(n,2)
  /* Comparison to merge-insertion sort:
   *            0, 0, 1, 3, 5,  7, 10, 13, 16, 19, 22, 26, 30, 34, 38,  42,  46,  50,  54,  58  */
  const exp = [ 0, 0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120, 136, 153, 171,
    190, 210, 231, 253, 276, 300, 325, 351, 378, 406, 435, 465, 496, 528, 561, 595, 630, 666,
    703, 741, 780, 820, 861, 903, 946, 990, 1035, 1081, 1128, 1176, 1225, 1275, 1326, 1378 ]
  exp.forEach( (v,i) => expect( compareAllComparisons(i) ).toStrictEqual(v) )
})

test('compareAllSort', async () => {
  // simple sort
  const baseComp = makeSimpleComp(['A','B','C','D'])
  let callCount = 0
  const comp :Comparator<string> = ab => { callCount++; return baseComp(ab) }
  expect( await compareAllSort([], comp) ).toStrictEqual([])
  expect( callCount ).toStrictEqual(0)
  expect( await compareAllSort(['B','A'], comp) ).toStrictEqual([ ['A',0], ['B',1] ])
  expect( callCount ).toStrictEqual(1)
  expect( await compareAllSort(['A','B'], comp) ).toStrictEqual([ ['A',0], ['B',1] ])
  expect( callCount ).toStrictEqual(2)
  expect( await compareAllSort(['C','D','B','A'], comp) )
    .toStrictEqual([ ['A',0], ['B',1], ['C',2], ['D',3] ])
  expect( callCount ).toStrictEqual(8)  // n!/(k!*(n-k)!) = 6
  expect( await compareAllSort(['A','B','C','D'], comp) )
    .toStrictEqual([ ['A',0], ['B',1], ['C',2], ['D',3] ])
  expect( callCount ).toStrictEqual(14)
  expect( await compareAllSort(['D','C','B','A'], comp) )
    .toStrictEqual([ ['A',0], ['B',1], ['C',2], ['D',3] ])
  expect( callCount ).toStrictEqual(20)

  // three-way tie
  // Alice beats Bob, Carol beats Alice, Bob beats Carol
  const baseCompTie = makeCustomComp({'A\0B':0,'A\0C':1,'B\0C':0})
  callCount = 0
  const compTie :Comparator<string> = ab => { callCount++; return baseCompTie(ab) }
  expect( await compareAllSort(['C','A','B'], compTie) )
    .toStrictEqual([ ['A',0], ['B',0], ['C',0] ])
  expect( callCount ).toStrictEqual(3)  // n!/(k!*(n-k)!) = 3
  expect( await compareAllSort(['B','C','A'], compTie) )
    .toStrictEqual([ ['A',0], ['B',0], ['C',0] ])
  expect( callCount ).toStrictEqual(6)
  expect( await compareAllSort(['A','B','C'], compTie) )
    .toStrictEqual([ ['A',0], ['B',0], ['C',0] ])
  expect( callCount ).toStrictEqual(9)
  expect( await compareAllSort(['C','B','A'], compTie) )
    .toStrictEqual([ ['A',0], ['B',0], ['C',0] ])
  expect( callCount ).toStrictEqual(12)
})

test('breakTies', async () => {
  expect( await breakTies([], failComp) ).toStrictEqual([])
  expect( await breakTies([['A',1]], failComp) ).toStrictEqual([['A',1]])
  expect( await breakTies([['A',1],['B',2]], failComp) ).toStrictEqual([['A',1],['B',2]])
  expect( await breakTies([['A',1],['B',2],['C',3]], failComp) ).toStrictEqual([['A',1],['B',2],['C',3]])

  const comp = makeSimpleComp(['G','F','E','D','C','B','A'])
  expect( await breakTies([['A',5],['B',5]], comp) ).toStrictEqual([['B',0],['A',1]])
  expect( await breakTies([['A',5],['B',5],['C',5]], comp) ).toStrictEqual([['C',0],['B',1],['A',2]])
  expect( await breakTies([['X',0],['A',1],['B',1],['C',1],['Y',2]], comp) ).toStrictEqual([['X',0],['C',1],['B',2],['A',3],['Y',4]])
  expect( await breakTies([['X',3],['A',5],['B',5],['C',5],['Y',10]], comp) ).toStrictEqual([['X',3],['C',4],['B',5],['A',6],['Y',7]])
  let callCount = 0
  const wrapComp :Comparator<string> = ab => { callCount++; return comp(ab) }
  expect( await breakTies([['A',0],['B',0],['X',1],['Y',2],['C',3],['D',3]], wrapComp) )
    .toStrictEqual([ ['B',0],['A',1],['X',2],['Y',3],['D',4],['C',5] ])
  expect( callCount ).toStrictEqual(2)
  /* The following scores may seem strange at first, but the reason is the delta between X and Y's scores in the input.
   * These kinds of scores are not expected anyway, since the functions in this module always normalize them.
   * These scores are basically just helper values for sorting and identifying ties! */
  expect( await breakTies([['A',5],['B',5],['X',10],['Y',15],['C',20],['D',20]], comp) )
    .toStrictEqual([ ['B',0],['A',1],['X',2],['Y',7],['D',8],['C',9] ])
})
