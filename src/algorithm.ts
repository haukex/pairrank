/** Ranking Algorithms
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
import { Comparator } from 'merge-insertion'
import { assert, paranoia } from './utils'

/** An array of tuples of (item, score). Scores must be >=0 and there may not be duplicate items. */
export type RankedResults = [item: string, score: number][]

/** Sort the given results **in-place**, first by score, second by string. */
export function sortResults(results :RankedResults, order :'asc'|'desc' = 'asc') {
  if (order==='asc')
    results.sort(([a1, a2], [b1, b2]) => a2 - b2 || a1.localeCompare(b1))
  else
    results.sort(([a1, a2], [b1, b2]) => b2 - a2 || a1.localeCompare(b1))
}

/** Normalize the scores **in-place** so they start at zero and there are no gaps; ties are kept.
 *
 * @param results The ranked results, **must** already be sorted by score!
 *  (Note this function does not care about or touch the strings that are the first item of the result tuples.)
 */
export function normalizeScores(results :RankedResults) {
  let prevScore :number = -1
  let curScore :number = -1
  for(const item of results) {
    if ( item[1]!=prevScore ) {
      prevScore = item[1]
      item[1] = ++curScore
    }
    else item[1] = curScore
  }
}

/** Find groups of more than one identical score.
 *
 * @param results The ranked results, **must** already be sorted by score!
 * @returns The index ranges of runs of more than one identical score (start inclusive, end exclusive).
 */
export function findTieGroups(results :Readonly<RankedResults>) :[first_incl: number, last_excl: number][] {
  const groups :[number,number][] = []
  let prevScore :number = -1
  let prevIdx :number = -1
  results.forEach((item, i) => {
    if ( item[1]!=prevScore ) {  // score changed
      if ( i>prevIdx+1 )  // run of longer than one
        groups.push([prevIdx,i])
      prevScore = item[1]
      prevIdx = i
    }
  })
  if (prevIdx<results.length-1)
    groups.push([prevIdx,results.length])
  return groups
}

/** The number of comparisons that {@link compareAllSort} will perform. */
export function compareAllComparisons(n :number) :number {
  const factorial = (x :bigint) => {
    let f = BigInt(1)
    for (let i=BigInt(1);i<=x;i++) f*=i
    return f }
  return Number( factorial(BigInt(n)) / ( BigInt(2) * factorial(BigInt(n)-BigInt(2)) ) )
}

export function* combinations2<T>(items :ReadonlyArray<T>) :Generator<[T,T], void, undefined> {
  for (let i = 0; i < items.length; i++)
    for (let j = i+1; j < items.length; j++)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      yield [items[i]!, items[j]!]
}

export async function compareAllSort(items :ReadonlyArray<string>, comparator :Comparator<string>) :Promise<RankedResults> {
  if (new Set(items).size != items.length)
    throw new Error('No duplicates allowed in items to be ranked')
  const scores: Map<string, number> = new Map(items.map(e => [e, 0]))
  for (const [a,b] of combinations2(items)) {
    const c = await comparator([a,b]) ? b : a
    const s = scores.get(c)
    scores.set( c, s ? s + 1 : 1 )
  }
  const results = Array.from(scores)
  sortResults(results)
  normalizeScores(results)
  return results
}

export async function breakTies(results :Readonly<RankedResults>, comparator :Comparator<string>) :Promise<RankedResults> {
  if (new Set(results.map(([s,])=>s)).size != results.length)
    throw new Error('No duplicates allowed in items to be ranked')
  const res :RankedResults = Array.from(results)
  await Promise.all( findTieGroups(res).map( async ([first,after]) => {
    // in this group, all the results are tied on their score, so force the user to re-evaluate
    const subRes = await compareAllSort(res.slice(first, after).map(([s,])=>s), comparator)
    // splice the sub-results back into the array, adjusting the scores accordingly
    const baseScoreBefore :number = (() => {
      if (first<=0) return 0
      const r = res[first-1]
      assert(r!=undefined)
      return r[1]+1 })()
    paranoia(after>first && after-first===subRes.length)
    let gi :number = 0
    for( let ri=first; ri<after; ri++ ) {
      const r = res[ri]
      const s = subRes[gi++]
      assert(r!=undefined && s!=undefined)
      r[0] = s[0]
      r[1] = s[1] + baseScoreBefore
    }
    paranoia(gi===subRes.length)
    // adjust the scores of all items following the spliced group (if any)
    if (after<results.length) {
      const sl = res[after-1]  // the last item spliced in
      const rr = res[after]    // the first item to adjust
      assert(sl!=undefined && rr!=undefined)
      const baseScoreAfter = sl[1] + 1 - rr[1]
      for( let ri=after; ri<results.length; ri++ ) {
        const r = res[ri]
        assert(r!=undefined)
        r[1] += baseScoreAfter
      }
    }
  }))
  return res
}
