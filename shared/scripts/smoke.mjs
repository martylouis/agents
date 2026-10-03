// Builder smoke check: open one route headless and confirm that the named elements render.
// It proves the elements are there and the page throws no errors; it is not a review.
//
// Usage: node smoke.mjs <url> <route> <expect> [expect ...] [--storage key=value ...]
//   expect: role:name, e.g. button:Pay now  heading:Your cart  textbox:Email
//   (name matches as a case-insensitive substring)
//   --storage key=value  set a localStorage item before the route opens (repeatable), for
//                        routes behind a sign-in, e.g. --storage 'auth={"user":"demo"}'.
//                        Use the key and value the app itself writes; never change the app
//                        to make a route reachable.
//
// Prints `ok   <role> "<name>"` or `MISSING <role> "<name>"` per expect, then one
// `ERROR <text>` line per console or page error. Exit 0 when all ok and no errors, else 1.
// Writes no files.
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const storage = []
for (let i = args.indexOf('--storage'); i >= 0; i = args.indexOf('--storage')) {
  const [item] = args.splice(i, 2).slice(1)
  const eq = item?.indexOf('=') ?? -1
  if (eq < 1) {
    console.error('--storage needs key=value')
    process.exit(1)
  }
  storage.push({ key: item.slice(0, eq), value: item.slice(eq + 1) })
}
const [url, route, ...expects] = args
if (!url || route === undefined || !expects.length) {
  console.error('Usage: node smoke.mjs <url> <route> <role:name> [role:name ...] [--storage key=value ...]')
  process.exit(1)
}
const base = url.replace(/\/$/, '')

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(e.message))

let failed = false
try {
  if (storage.length) {
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' })
    await page.evaluate((items) => items.forEach(({ key, value }) => localStorage.setItem(key, value)), storage)
  }
  await page.goto(base + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
} catch (e) {
  errors.push(e.message.split('\n')[0])
}

for (const expect of expects) {
  const i = expect.indexOf(':')
  const role = i < 0 ? expect : expect.slice(0, i)
  const name = i < 0 ? '' : expect.slice(i + 1)
  const all = await page.getByRole(role, { name, exact: false }).all().catch(() => [])
  let visible = false
  for (const el of all) if (await el.isVisible()) visible = true
  if (!visible) failed = true
  console.log(`${visible ? 'ok  ' : 'MISSING'} ${role} "${name}"`)
}
for (const e of errors) console.log(`ERROR ${e.replace(/\s+/g, ' ').slice(0, 160)}`)

await browser.close()
process.exit(failed || errors.length ? 1 : 0)
