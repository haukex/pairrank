/** Utilities
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

export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg) }

/** Exactly the same as `assert`, but label paranoid checks as such (i.e. they could be removed someday) */
export function paranoia(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg) }

/** Non-recursive version of Heap's algorithm
 *
 * https://en.wikipedia.org/wiki/Heap%27s_algorithm
 */
export function* permutations<T>(array :Readonly<T[]>): Generator<T[]> {
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
