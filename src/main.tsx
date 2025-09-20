/** Main TypeScript Entry Point
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
import { jsx, safeCastElement } from './jsx-dom'
import { assert } from './utils'

if (module.hot) module.hot.accept()  // for the parcel development environment

window.addEventListener('DOMContentLoaded', async () => {
  const htmlMain = document.querySelector('main')
  assert(htmlMain instanceof HTMLElement)

  const fooDiv = safeCastElement(HTMLDivElement, <div class="notice info">Hello, World!</div>)
  htmlMain.appendChild(fooDiv)
})
