/** This file is a mostly AI-GENERATED implementation of the Merge-insertion sort AKA the Ford-Johnson algorithm.
 * I haven't *yet* checked in detail whether this code faithfully implements the algorithm;
 * though I have written tests by hand to check that the sorting results are correct.
 *
 * This algorithm is the one with the lowest number of comparisons (=user prompts) for our case:
 * https://en.wikipedia.org/wiki/Merge-insertion_sort
 * "Merge-insertion sort is the sorting algorithm with the minimum possible comparisons for n items whenever n ≤ 22."
 */
import { Comparator } from './algorithm'
import { assert } from './utils'

/** Merge-Insertion Sort (Ford-Johnson) for strings with async comparison.
 *
 * @param items Array of strings to sort.
 * @param comparator Async comparison function.
 * @returns Sorted array of strings.
 */
export async function mergeInsertionSort(items :string[], comparator :Comparator) :Promise<string[]> {
  if (items.length <= 1) return Array.from(items)

  // Step 1: Pair up elements and sort each pair
  const pairs :[smaller :string, larger :string][] = []
  let leftover :string|undefined
  for ( let i=0; i<items.length; i+=2 ) {
    if ( i+1 < items.length ) {
      const a = items[i]
      const b = items[i+1]
      assert(a!=undefined && b!=undefined)
      pairs.push(await comparator([a, b]) ? [a, b] : [b, a])
    }
    else leftover = items[i]
  }

  // Step 2: Recursively sort the second (larger) elements of each pair
  const result = await mergeInsertionSort(pairs.map(pair => pair[1]), comparator)

  // Binary search for insertion point and insert
  const binSearchInsert = async (what :string) => {
    let left = 0, right = result.length
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      const rm = result[mid]
      assert(rm!=undefined)
      if (await comparator([what, rm]))
        right = mid
      else
        left = mid + 1
    }
    result.splice(left, 0, what)
  }

  // Step 3: Insert second elements of each pair into results
  for (const pair of pairs)
    await binSearchInsert(pair[0])

  // Step 4: Insert leftover if exists
  if (leftover != undefined)
    await binSearchInsert(leftover)

  return result
}