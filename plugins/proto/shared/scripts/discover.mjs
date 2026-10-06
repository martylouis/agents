// State discovery: open each route, read the accessibility tree, and write a states file
// that observe.mjs can run. Used by the review skill when no states file exists.
//
// Usage: node discover.mjs <baseUrl> <out.json> [--crawl] <route> [route ...]
//   --crawl   also visit same-origin links found on the pages (max 30 routes in total)
//
// Per route it writes: <route>-default, <route>-phone (375×812), <route>-dark, and one
// <route>-click-<name> state per visible button, link, tab, switch, checkbox, radio,
// or menu item (max 20 per route; duplicates by role and name are skipped).
// Text fields are listed in the summary but get no state: form submissions need
// valid and invalid data that only the plan knows.
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const args = process.argv.slice(2)
const crawl = args.includes('--crawl')
const [baseUrl, outPath, ...routes] = args.filter((a) => a !== '--crawl')
if (!baseUrl || !outPath || !routes.length) {
  console.error('Usage: node discover.mjs <baseUrl> <out.json> [--crawl] <route> [route ...]')
  process.exit(1)
}

const CLICKABLE = ['button', 'link', 'tab', 'switch', 'checkbox', 'radio', 'menuitem']
const FIELDS = ['textbox', 'combobox', 'searchbox', 'spinbutton']
const MAX_ROUTES = 30
const MAX_PER_ROUTE = 20
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'root'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const queue = [...new Set(routes)]
const seen = new Set()
const states = []
const summary = []

while (queue.length && seen.size < MAX_ROUTES) {
  const route = queue.shift()
  if (seen.has(route)) continue
  seen.add(route)
  const name = slug(route)
  try {
    await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
  } catch (e) {
    summary.push(`CHECK ${route}: ${e.message.split('\n')[0]}`)
    continue
  }
  const aria = await page.locator('body').ariaSnapshot().catch(() => '')
  const found = new Map()
  const fields = []
  for (const line of aria.split('\n')) {
    const m = line.match(/^\s*- (\w+) "((?:[^"\\]|\\.)+)"/)
    if (!m) continue
    const role = m[1]
    const label = m[2].replace(/\\(.)/g, '$1')
    if (CLICKABLE.includes(role) && !found.has(`${role}:${label}`)) found.set(`${role}:${label}`, { role, name: label })
    if (FIELDS.includes(role)) fields.push(label)
  }

  states.push({ name: `${name}-default`, steps: [{ goto: route }] })
  states.push({ name: `${name}-phone`, viewport: { width: 375, height: 812 }, steps: [{ goto: route }] })
  states.push({ name: `${name}-dark`, colorScheme: 'dark', steps: [{ goto: route }] })
  const elements = [...found.values()].slice(0, MAX_PER_ROUTE)
  const used = new Set()
  for (const el of elements) {
    let id = `${name}-click-${slug(el.name)}`
    while (used.has(id)) id += '-2'
    used.add(id)
    states.push({ name: id, steps: [{ goto: route }, { click: el }] })
  }
  summary.push(
    `ok ${route}: ${elements.length} clickable${found.size > MAX_PER_ROUTE ? ` (of ${found.size})` : ''}` +
      (fields.length ? `, fields: ${fields.map((f) => `"${f}"`).join(', ')}` : ''),
  )

  if (crawl) {
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href)).catch(() => [])
    for (const href of hrefs) {
      if (!href.startsWith(baseUrl)) continue
      const r = href.slice(baseUrl.length).split('#')[0] || '/'
      if (!seen.has(r) && !queue.includes(r)) queue.push(r)
    }
  }
}

await browser.close()
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify({ baseUrl, discovered: new Date().toISOString().slice(0, 10), states }, null, 2) + '\n')
console.log(summary.join('\n'))
console.log(`${states.length} states from ${seen.size} routes → ${outPath}`)
