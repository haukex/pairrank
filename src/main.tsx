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
import { breakTies, Comparator, compareAllSort, findTieGroups, RankedResults, sortResults } from './algorithm'
import { jsx, safeCastElement } from './jsx-dom'
import { assert } from './utils'

if (module.hot) module.hot.accept()  // for the parcel development environment

window.addEventListener('error', event =>
  alert(`Internal Error (please report): ${event.message} (${event.error})`))
window.addEventListener('unhandledrejection', event =>
  alert(`Internal Error (please report): Promise rejected (${event.reason})`))

class GlobalContext {
  private readonly header
  private readonly main
  constructor(header :HTMLElement, main :HTMLElement) {
    this.header = header
    this.main = main
  }
  scrollTo(target :HTMLElement) {
    setTimeout(() => {  // don't scroll until rendered
      target.style.setProperty('scroll-margin-top',    `${this.header.getBoundingClientRect().height+5}px`)
      // footer isn't sticky, so don't need this:
      //target.style.setProperty('scroll-margin-bottom', `${this.footer.getBoundingClientRect().height+5}px`)
      target.scrollIntoView({ block: 'center', behavior: 'auto' })
    }, 1)  // I think this should ensure we fire after any other `setTimeout(..., 0)`s
  }
  addSection(contents :HTMLElement, scrollTo :boolean = true) {
    const section = <section>{contents}</section>
    this.main.appendChild(section)
    if (scrollTo) this.scrollTo(section)
  }
  addToCurrentSection(contents :HTMLElement, scrollTo :boolean = true) {
    const section = this.main.querySelector('section:last-of-type')
    if (section!=undefined) {
      assert(section instanceof HTMLElement)
      section.appendChild(contents)
      if (scrollTo) this.scrollTo(section)
    }
    else throw new Error('addToCurrentSection when there is no section')
  }
  clearSections() {
    Array.from(this.main.querySelectorAll('section')).forEach(section => this.main.removeChild(section))
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const htmlHeader = document.querySelector('header')
  const htmlMain = document.querySelector('main')
  const htmlFooter = document.querySelector('footer')
  assert(htmlHeader instanceof HTMLElement && htmlMain instanceof HTMLElement && htmlFooter instanceof HTMLElement)
  const ctx = new GlobalContext(htmlHeader, htmlMain)

  let unsavedChanges = false
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
  window.addEventListener('beforeunload', event => {
    if ( unsavedChanges ) {
      event.preventDefault()
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      event.returnValue = true  // MDN says it's best practice to still do this despite deprecation
      return true
    }
    return undefined
  })

  const comp = makeComparator(ctx)
  while (true) {
    unsavedChanges = false
    const items = await getItems(ctx)
    unsavedChanges = true
    let results = await compareAllSort(items, comp)
    displayResults(ctx, results)
    while (findTieGroups(results).length) {
      if (!await askBreakTies(ctx)) break
      results = await breakTies(results, comp)
      displayResults(ctx, results)
    }
    await askStartOver(ctx)
  }
})

/** Prompt the user for a list of items to compare. */
async function getItems(ctx :GlobalContext) :Promise<string[]> {
  const itemBox = safeCastElement(HTMLTextAreaElement,
    <textarea placeholder="Items to compare, one per line" rows="5"></textarea>)
  const boxNotice = safeCastElement(HTMLDivElement,
    <div class="notice notice-narrow d-none warning"></div>)
  const btnStart = safeCastElement(HTMLButtonElement, <button class="btn-normal primary" disabled>🚀 Compare!</button>)

  const boxParse = () => itemBox.value.split(/\r?\n/).map(s=>s.trim()).filter(s=>s.length)

  const boxChanged = () => {
    const items = boxParse()
    if (items.length<3) {
      boxNotice.innerText = '⚠️ Please enter at least three items.'
      boxNotice.classList.remove('d-none')
      btnStart.disabled = true
    }
    else if (new Set(items).size != items.length) {
      boxNotice.innerText = '⚠️ Please remove duplicates from the list.'
      boxNotice.classList.remove('d-none')
      btnStart.disabled = true
    }
    else {
      boxNotice.classList.add('d-none')
      btnStart.disabled = false
    }
  }
  boxChanged()
  itemBox.addEventListener('input', boxChanged)
  itemBox.addEventListener('focusout', boxChanged)

  itemBox.addEventListener('keydown', event => {
    if (event.defaultPrevented) return
    if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey) && !btnStart.disabled) {
      event.preventDefault()
      event.stopPropagation()
      btnStart.click()
    }
  })

  ctx.addSection(<article class="enter-choices">
    <h2>Compare what?</h2>
    {itemBox} {boxNotice}
    <div>{btnStart}</div>
  </article>)
  setTimeout(() => itemBox.focus(), 2)

  return new Promise<string[]>(resolve => {
    btnStart.addEventListener('click', () => {
      setTimeout(() => {
        // I've had the experience that setting things disabled can mess with the other behavior, so defer that
        itemBox.readOnly = true
        btnStart.disabled = true
      }, 0)
      const items = boxParse()
      assert(items.length>2 && new Set(items).size===items.length)
      resolve(items)
    })
  })
}

function makeComparator(ctx :GlobalContext) :Comparator {
  return ([a,b]) => {
    const btnA = safeCastElement(HTMLButtonElement, <button class="choice">{a}</button>)
    const btnB = safeCastElement(HTMLButtonElement, <button class="choice">{b}</button>)
    const div = <div class="make-choice"><h3>Make your choice:</h3><div class="choices">{btnA} {btnB}</div></div>
    ctx.addSection(div)
    setTimeout(() => btnA.focus(), 2)
    const keyHandler = (event :KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key==='1' || event.key==='a' || event.key==='A') {
        event.preventDefault()
        event.stopPropagation()
        btnA.click()
      }
      else if (event.key==='2' || event.key==='b' || event.key==='B') {
        event.preventDefault()
        event.stopPropagation()
        btnB.click()
      }
    }
    window.addEventListener('keydown', keyHandler)
    return new Promise<0|1>(resolve => {
      const click = (event :MouseEvent) => {
        assert(Object.is(event.target, btnA) || Object.is(event.target, btnB))
        const choice = Object.is(event.target, btnA) ? 0 : 1
        window.removeEventListener('keydown', keyHandler)
        btnA.removeEventListener('click', click)
        btnB.removeEventListener('click', click)
        btnA.classList.add(choice ? 'not-chosen' : 'is-chosen')
        btnB.classList.add(choice ? 'is-chosen' : 'not-chosen')
        div.classList.add('chosen')
        resolve(choice)
      }
      btnA.addEventListener('click', click)
      btnB.addEventListener('click', click)
    })
  }
}

function displayResults(ctx :GlobalContext, results :RankedResults) {
  sortResults(results, 'desc')
  const list = safeCastElement(HTMLOListElement, <ol class="results-list"></ol>)
  const htmlDoc = document.implementation.createHTMLDocument()
  htmlDoc.title = 'Results'
  const htmlList = htmlDoc.createElement('ol')
  htmlDoc.body.appendChild(htmlList)
  let asText :string = ''
  let textCounter :number = 1
  let prevScore = -1
  const itemsAtScore :string[] = []
  let haveTies = false as boolean  // workaround for @typescript-eslint/no-unnecessary-condition
  const scoreDone = () => {
    if (itemsAtScore.length>1) {
      haveTies = true
      // add to visible document
      list.appendChild(<li>Tied: <ul>{itemsAtScore.map(it => <li>{it}</li>)}</ul></li>)
      // generate html and text
      asText += `${textCounter++}. Tied:\n`
      const ul = htmlDoc.createElement('ul')
      itemsAtScore.forEach(it => {
        const li = htmlDoc.createElement('li')
        li.innerText = it
        ul.appendChild(li)
        asText += `   - ${it}\n`
      })
      const oLi = htmlDoc.createElement('li')
      oLi.appendChild(htmlDoc.createTextNode('Tied:'))
      oLi.appendChild(ul)
      htmlList.appendChild(oLi)
    }
    else if (itemsAtScore.length) {
      const it = itemsAtScore[0]
      assert(it!=undefined)
      // add to visible document
      list.appendChild(<li>{it}</li>)
      // generate html and text
      const li = htmlDoc.createElement('li')
      li.innerText = it
      htmlList.appendChild(li)
      asText += `${textCounter++}. ${it}\n`
    }
    itemsAtScore.length = 0
  }
  results.forEach(([item,score]) => {
    if (score!=prevScore) scoreDone()
    prevScore = score
    itemsAtScore.push(item)
  })
  scoreDone()
  const asHtml = htmlDoc.documentElement.outerHTML
  const btnCopy = safeCastElement(HTMLAnchorElement, <a class="copy-results" href="#">📋 Copy</a>)
  btnCopy.addEventListener('click', async event => {
    event.preventDefault()
    const clipItems = [ new ClipboardItem({
      'text/plain': new Blob([asText], { type: 'text/plain', endings: 'native' }),
      'text/html':  new Blob([asHtml], { type: 'text/html' }) }) ]
    //console.debug(asHtml); console.debug(asText)
    try { await navigator.clipboard.write(clipItems) }
    catch (ex) {
      console.warn(ex)
      alert('Copy failed: You may need to give me the permission to write to the clipboard.')
    }
  })
  const article = <article class="results">
    <div class="results-title"> <h2>Results{haveTies ? '' : ' 🎉'}</h2> {btnCopy} </div>
    {list} </article>
  if (!haveTies) article.classList.add('final-results')
  ctx.addSection(article)
  setTimeout(() => btnCopy.focus(), 2)
}

async function askBreakTies(ctx :GlobalContext, curSection :boolean = true) :Promise<boolean> {
  const btnYes = safeCastElement(HTMLButtonElement, <button class="btn-normal success">✔️ Yes</button>)
  const btnNo = safeCastElement(HTMLButtonElement, <button class="btn-normal warning">❌ No</button>)
  const div = <div class="break-ties">Break ties? {btnYes} {btnNo}</div>
  if (curSection) ctx.addToCurrentSection(div); else ctx.addSection(div)
  setTimeout(() => btnYes.focus(), 3)
  const keyHandler = (event :KeyboardEvent) => {
    if (event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key==='y' || event.key==='Y') {
      event.preventDefault()
      event.stopPropagation()
      btnYes.click()
    }
    else if (event.key==='n' || event.key==='N') {
      event.preventDefault()
      event.stopPropagation()
      btnNo.click()
    }
  }
  window.addEventListener('keydown', keyHandler)
  const disable = () => {
    window.removeEventListener('keydown', keyHandler)
    setTimeout(() => btnYes.disabled = btnNo.disabled = true, 0)
  }
  return new Promise<boolean>(resolve => {
    btnYes.addEventListener('click', () => { disable(); resolve(true) })
    btnNo.addEventListener('click', () => { disable(); resolve(false) })
  })
}

async function askStartOver(ctx :GlobalContext, curSection :boolean = true) :Promise<void> {
  const btnStartOver = safeCastElement(HTMLButtonElement, <button class="btn-normal danger">🗑️ Reset and Start Over</button>)
  const div = <div class="start-over">{btnStartOver}</div>
  if (curSection) ctx.addToCurrentSection(div); else ctx.addSection(div)
  const keyHandler = (event :KeyboardEvent) => {
    if (event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key==='Escape') {
      event.preventDefault()
      event.stopPropagation()
      btnStartOver.click()
    }
  }
  window.addEventListener('keydown', keyHandler)
  return new Promise<void>(resolve => {
    btnStartOver.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all data?')) {
        ctx.clearSections()
        window.removeEventListener('keydown', keyHandler)
        resolve()
      }
    })
  })
}
