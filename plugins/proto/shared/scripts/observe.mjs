// Reviewer code facts: open each state, take a screenshot, and record the accessibility
// tree, focused element, horizontal overflow, step errors, and console errors as text.
//
// Usage: node observe.mjs <states.json> <outDir> [stateName ...]
//   With state names, only those states run. FACTS.md keeps the sections of the other states.
//
// states.json: { "baseUrl": "http://localhost:5173", "states": [ { "name", "viewport"?, "colorScheme"?,
//   "fullPage"?, "capture"?, "offline"?, "steps": [...] } ] }
// State options:
//   "fullPage": true       screenshot the whole page (default: the viewport only)
//   "capture": "#drawer"   screenshot only the first element matching this CSS selector
//                          (not found: step error, viewport screenshot instead)
//   "offline": true        sets the browser offline after the LAST goto, so the screen
//                          is loaded and later requests fail like on a plane
// Steps (one key each):
//   { "goto": "/path" }                         open a route
//   { "storage": { "key": "k", "value": "v" } } set localStorage (value null removes)
//   { "fill": { "label": "Email", "value": "a@b.c" } }
//   { "click": { "role": "button", "name": "Save" } }
//   { "clickText": { "text": "Exact text" } }
//   { "hover": { "role": "button", "name": "Save" } }
//   { "press": { "key": "Enter" } }
//   { "tab": 3 }                                press Tab 3 times
//   { "wait": { "ms": 500 } }
//   { "offline": true }                         go offline (or back online with false) at this step
// fill, click, clickText and hover fail when more than one element matches;
// add "nth": 0 (zero-based) to pick one, e.g. { "click": { "role": "button", "name": "Save", "nth": 0 } }.
//
// A submit that the browser's own form validation blocks (a native pop-up instead of the
// app's error text) is recorded under "Native validation" and makes the state CHECK.
//
// Output per state: <name>.png, and its section in FACTS.md (sections of states that ran are replaced).
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const [specPath, outDir, ...only] = process.argv.slice(2)
if (!specPath || !outDir) {
  console.error('Usage: node observe.mjs <states.json> <outDir> [stateName ...]')
  process.exit(1)
}
const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const states = only.length ? spec.states.filter((s) => only.includes(s.name)) : spec.states
mkdirSync(outDir, { recursive: true })

// One element or an error: waits up to 5 s for a first match, then refuses ambiguous locators.
async function one(locator, desc, nth) {
  await locator.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {})
  const n = await locator.count()
  if (n === 0) throw new Error(`${desc} matches no element`)
  if (nth !== undefined) {
    if (nth < 0 || nth >= n) throw new Error(`${desc} nth ${nth} out of range (${n} elements)`)
    return locator.nth(nth)
  }
  if (n > 1) throw new Error(`${desc} matches ${n} elements`)
  return locator
}

// Role and accessible name of document.activeElement, as one line.
const focused = () => {
  const el = document.activeElement
  if (!el) return 'none'
  if (el === document.body || el === document.documentElement) return 'body'
  const tag = el.tagName.toLowerCase()
  const type = (el.getAttribute('type') || 'text').toLowerCase()
  const role =
    el.getAttribute('role') ||
    (tag === 'a' ? 'link' : tag === 'select' ? 'combobox' : tag === 'textarea' ? 'textbox' : tag === 'button' ? 'button' : '') ||
    (tag === 'input' ? (['checkbox', 'radio'].includes(type) ? type : ['button', 'submit', 'reset'].includes(type) ? 'button' : 'textbox') : tag)
  const labelled = el.getAttribute('aria-labelledby')
  const name =
    el.getAttribute('aria-label') ||
    (labelled && labelled.split(/\s+/).map((id) => document.getElementById(id)?.innerText ?? '').join(' ')) ||
    (el.labels && el.labels.length ? el.labels[0].innerText : '') ||
    el.innerText ||
    el.getAttribute('placeholder') ||
    ''
  return `${role} "${name.replace(/\s+/g, ' ').trim().slice(0, 80)}"`
}

const browser = await chromium.launch()
const summary = []
const sections = new Map()

for (const state of states) {
  const viewport = state.viewport ?? { width: 1280, height: 800 }
  const scheme = state.colorScheme ?? 'light'
  const context = await browser.newContext({ viewport, colorScheme: scheme })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))

  // The browser fires "invalid" when its own validation blocks a submit.
  await context.addInitScript(() => {
    window.__uxInvalid = []
    document.addEventListener('invalid', (e) => {
      const el = e.target
      const label = el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.name || el.id || el.tagName.toLowerCase()
      window.__uxInvalid.push(`${label.replace(/\s+/g, ' ').trim().slice(0, 60)}: ${el.validationMessage}`)
    }, true)
  })

  const stepErrors = []
  const lastGoto = state.steps.map((s) => s.goto !== undefined).lastIndexOf(true)
  try {
    for (const [i, s] of state.steps.entries()) {
      if (s.goto !== undefined) {
        await page.goto(spec.baseUrl + s.goto, { waitUntil: 'networkidle' })
        if (state.offline && i === lastGoto) await context.setOffline(true)
      } else if (s.offline !== undefined) await context.setOffline(!!s.offline)
      else if (s.storage) {
        await page.evaluate(({ key, value }) => {
          if (value === null) localStorage.removeItem(key)
          else localStorage.setItem(key, value)
        }, s.storage)
      } else if (s.fill) {
        const el = await one(page.getByLabel(s.fill.label, { exact: false }), `fill label "${s.fill.label}"`, s.fill.nth)
        await el.fill(s.fill.value, { timeout: 5000 })
      } else if (s.click) {
        const el = await one(page.getByRole(s.click.role, { name: s.click.name }), `click ${s.click.role} "${s.click.name}"`, s.click.nth)
        await el.click({ timeout: 5000 })
      } else if (s.clickText) {
        const el = await one(page.getByText(s.clickText.text, { exact: true }), `clickText "${s.clickText.text}"`, s.clickText.nth)
        await el.click({ timeout: 5000 })
      } else if (s.hover) {
        const el = await one(page.getByRole(s.hover.role, { name: s.hover.name }), `hover ${s.hover.role} "${s.hover.name}"`, s.hover.nth)
        await el.hover({ timeout: 5000 })
      } else if (s.press) await page.keyboard.press(s.press.key)
      else if (s.tab !== undefined) for (let i = 0; i < s.tab; i++) await page.keyboard.press('Tab')
      else if (s.wait) await page.waitForTimeout(s.wait.ms)
    }
    await page.waitForTimeout(400)
  } catch (e) {
    stepErrors.push(e.message.split('\n')[0])
  }

  const png = join(outDir, `${state.name}.png`)
  let captureMissing = false
  if (state.capture) {
    const target = page.locator(state.capture).first()
    if ((await page.locator(state.capture).count()) > 0) await target.screenshot({ path: png })
    else {
      captureMissing = true
      stepErrors.push(`capture "${state.capture}" not found, viewport screenshot instead`)
    }
  }
  if (!state.capture || captureMissing) await page.screenshot({ path: png, fullPage: !!state.fullPage })
  const aria = await page.locator('body').ariaSnapshot().catch((e) => `(aria error: ${e.message})`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  const focus = await page.evaluate(focused).catch(() => 'none')
  const invalid = [...new Set(await page.evaluate(() => window.__uxInvalid ?? []).catch(() => []))]

  const shot = state.capture && !captureMissing ? `, element ${state.capture}` : state.fullPage ? ', full page' : ''
  sections.set(
    state.name,
    [
      `## State: ${state.name}`,
      ``,
      `- URL: ${page.url().replace(spec.baseUrl, '') || '/'}`,
      `- Viewport: ${viewport.width}×${viewport.height}, ${scheme}${state.offline || state.steps.some((s) => s.offline) ? ', offline' : ''}`,
      `- Screenshot: ${state.name}.png${shot}`,
      `- Horizontal overflow: ${overflow ? 'YES' : 'no'}`,
      `- Focused: ${focus}`,
      `- Native validation: ${invalid.length ? invalid.map((v) => '`' + v + '`').join('; ') : 'none'}`,
      `- Step error: ${stepErrors.length ? stepErrors.join('; ') : 'none'}`,
      `- Console errors: ${errors.length ? errors.map((e) => '`' + e.slice(0, 160) + '`').join('; ') : 'none'}`,
      ``,
      '```yaml',
      aria,
      '```',
      ``,
    ].join('\n'),
  )
  const flags = [
    stepErrors.length > (captureMissing ? 1 : 0) && 'step error',
    captureMissing && 'capture not found',
    errors.length && 'console errors',
    overflow && 'overflow',
    invalid.length && 'native validation blocked a submit',
  ].filter(Boolean)
  summary.push(`${flags.length ? 'CHECK' : 'ok   '} ${state.name}${flags.length ? ' — ' + flags.join(', ') : ''}`)
  await context.close()
}

await browser.close()

// Merge into FACTS.md: keep sections of states that did not run, replace the others,
// order by states.json, then any others in their old order.
const factsPath = join(outDir, 'FACTS.md')
const merged = new Map()
if (existsSync(factsPath)) {
  const parts = readFileSync(factsPath, 'utf8').split(/^(?=## State: )/m).slice(1)
  for (const part of parts) merged.set(part.match(/^## State: (.*)$/m)[1].trim(), part.replace(/\n*$/, '\n'))
}
for (const [name, text] of sections) merged.set(name, text)
const order = spec.states.map((s) => s.name)
const rank = (n) => (order.includes(n) ? order.indexOf(n) : Number.MAX_SAFE_INTEGER)
const names = [...merged.keys()].sort((a, b) => rank(a) - rank(b))
const facts = [`# Code facts`, ``, `Base URL: ${spec.baseUrl}`, ``, ...names.map((n) => merged.get(n))]
writeFileSync(factsPath, facts.join('\n'))

console.log(summary.join('\n'))
console.log(`FACTS.md: ${names.length} states in ${outDir}`)
