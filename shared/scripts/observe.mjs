// Reviewer code facts: open each state, take a screenshot, and record the
// accessibility tree, horizontal overflow, step errors, and console errors as text.
//
// Usage: node observe.mjs <states.json> <outDir> [stateName ...]
//   With state names, only those states run. Other state files in outDir stay.
//
// states.json: { "baseUrl": "http://localhost:5173", "states": [ { "name", "viewport"?, "colorScheme"?, "steps": [...] } ] }
// Steps (one key each):
//   { "goto": "/path" }                         open a route
//   { "storage": { "key": "k", "value": "v" } } set localStorage (value null removes)
//   { "fill": { "label": "Email", "value": "a@b.c" } }
//   { "click": { "role": "button", "name": "Save" } }
//   { "clickText": { "text": "Exact text" } }
//   { "hover": { "role": "button", "name": "Save" } }
//   { "press": { "key": "Enter" } }
//   { "wait": { "ms": 500 } }
//
// Output per state: <name>.png and <name>.md. FACTS.md is rebuilt from all <name>.md files.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const [specPath, outDir, ...only] = process.argv.slice(2)
if (!specPath || !outDir) {
  console.error('Usage: node observe.mjs <states.json> <outDir> [stateName ...]')
  process.exit(1)
}
const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const states = only.length ? spec.states.filter((s) => only.includes(s.name)) : spec.states
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const summary = []

for (const state of states) {
  const viewport = state.viewport ?? { width: 1280, height: 800 }
  const scheme = state.colorScheme ?? 'light'
  const context = await browser.newContext({ viewport, colorScheme: scheme })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))

  let stepError = null
  try {
    for (const s of state.steps) {
      if (s.goto !== undefined) await page.goto(spec.baseUrl + s.goto, { waitUntil: 'networkidle' })
      else if (s.storage) {
        await page.evaluate(({ key, value }) => {
          if (value === null) localStorage.removeItem(key)
          else localStorage.setItem(key, value)
        }, s.storage)
      } else if (s.fill) await page.getByLabel(s.fill.label, { exact: false }).first().fill(s.fill.value, { timeout: 5000 })
      else if (s.click) await page.getByRole(s.click.role, { name: s.click.name }).first().click({ timeout: 5000 })
      else if (s.clickText) await page.getByText(s.clickText.text, { exact: true }).first().click({ timeout: 5000 })
      else if (s.hover) await page.getByRole(s.hover.role, { name: s.hover.name }).first().hover({ timeout: 5000 })
      else if (s.press) await page.keyboard.press(s.press.key)
      else if (s.wait) await page.waitForTimeout(s.wait.ms)
    }
    await page.waitForTimeout(400)
  } catch (e) {
    stepError = e.message.split('\n')[0]
  }

  await page.screenshot({ path: join(outDir, `${state.name}.png`), fullPage: true })
  const aria = await page.locator('body').ariaSnapshot().catch((e) => `(aria error: ${e.message})`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)

  const record = [
    `## State: ${state.name}`,
    ``,
    `- URL: ${page.url().replace(spec.baseUrl, '') || '/'}`,
    `- Viewport: ${viewport.width}×${viewport.height}, ${scheme}`,
    `- Screenshot: ${state.name}.png`,
    `- Horizontal overflow: ${overflow ? 'YES' : 'no'}`,
    `- Step error: ${stepError ?? 'none'}`,
    `- Console errors: ${errors.length ? errors.map((e) => '`' + e.slice(0, 160) + '`').join('; ') : 'none'}`,
    ``,
    '```yaml',
    aria,
    '```',
    ``,
  ].join('\n')
  writeFileSync(join(outDir, `${state.name}.md`), record)
  const flags = [stepError && 'step error', errors.length && 'console errors', overflow && 'overflow'].filter(Boolean)
  summary.push(`${flags.length ? 'CHECK' : 'ok   '} ${state.name}${flags.length ? ' — ' + flags.join(', ') : ''}`)
  await context.close()
}

await browser.close()

// Rebuild FACTS.md from every state file: states.json order first, then any others.
const order = spec.states.map((s) => s.name)
const rank = (f) => {
  const i = order.indexOf(f.slice(0, -3))
  return i < 0 ? Number.MAX_SAFE_INTEGER : i
}
const files = readdirSync(outDir)
  .filter((f) => f.endsWith('.md') && f !== 'FACTS.md' && f !== 'DESCRIPTION.md')
  .sort((a, b) => rank(a) - rank(b))
const facts = [`# Code facts`, ``, `Base URL: ${spec.baseUrl}`, ``, ...files.map((f) => readFileSync(join(outDir, f), 'utf8'))]
writeFileSync(join(outDir, 'FACTS.md'), facts.join('\n'))

console.log(summary.join('\n'))
console.log(`FACTS.md: ${files.length} states in ${outDir}`)
