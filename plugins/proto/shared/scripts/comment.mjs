// Comment mode: open the prototype in a visible browser with a small overlay. The person
// clicks "Comment", clicks an element, and types a comment. Each comment becomes a feedback
// item with the route, the element, a cropped screenshot, and the text.
//
// Usage: node comment.mjs <url> <round dir> [--round N] [--crops <dir>]
//   <round dir>   for example docs/ux/.scratch/2026-10-04-feedback-r3/items; items are written as FB-<NNN>.md
//   --crops <dir> where the cropped screenshots go (default: <round dir>); use the round's scratch folder
//   --round N     the round number written into each item (default: the number in <round dir>)
//
// IDs continue from the highest FB-<NNN> found in docs/ux/HISTORY.md (cwd = prototype root) or under the parent of <round dir>.
// The overlay lives only in this browser window. It never changes the prototype's code.
// The script ends when the person closes the window; it prints one line per item.
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  return i < 0 ? undefined : args.splice(i, 2)[1]
}
const roundArg = flag('--round')
const cropArg = flag('--crops')
const [url, roundDir] = args
if (!url || !roundDir) {
  console.error('Usage: node comment.mjs <url> <round dir> [--round N] [--crops <dir>]')
  process.exit(1)
}
const round = Number(roundArg ?? basename(roundDir).replace(/\D/g, '')) || 1

function highestId(dir) {
  if (!existsSync(dir)) return 0
  let max = 0
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) max = Math.max(max, highestId(p))
    const m = f.match(/^FB-(\d+)\.md$/)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max
}
function historyId() {
  const file = join('docs', 'ux', 'HISTORY.md')
  if (!existsSync(file)) return 0
  const ids = [...readFileSync(file, 'utf8').matchAll(/FB-(\d+)/g)].map((m) => Number(m[1]))
  return Math.max(0, ...ids)
}
let next = Math.max(highestId(dirname(roundDir)), historyId()) + 1
mkdirSync(roundDir, { recursive: true })
const cropDir = cropArg ?? roundDir
mkdirSync(cropDir, { recursive: true })

// Runs in the page. Shadow DOM keeps the overlay's styles away from the prototype's.
const overlay = () => {
  if (window.top !== window || window.__uxComment) return
  window.__uxComment = true
  const start = () => {
    const host = document.createElement('ux-comment-overlay')
    host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;inset:auto 16px 16px auto'
    const root = host.attachShadow({ mode: 'closed' })
    root.innerHTML = `
      <style>
        * { font: 13px/1.4 system-ui, sans-serif; box-sizing: border-box; }
        .bar { background: #111; color: #fff; border-radius: 8px; padding: 8px; display: flex; gap: 8px; align-items: center; box-shadow: 0 4px 16px #0004; }
        button { background: #fff; color: #111; border: 0; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
        button.primary { background: #ffd400; }
        .box { display: none; flex-direction: column; gap: 6px; margin-top: 8px; background: #111; padding: 8px; border-radius: 8px; width: 300px; }
        textarea { width: 100%; min-height: 72px; border-radius: 6px; border: 0; padding: 6px; }
        .hint { color: #ccc; max-width: 300px; }
      </style>
      <div class="bar"><button class="primary" id="go">Comment</button><span class="hint" id="hint">Click "Comment", then an element.</span></div>
      <div class="box" id="box"><span class="hint" id="target"></span><textarea id="text" aria-label="Comment text"></textarea>
        <div style="display:flex;gap:6px;justify-content:flex-end"><button id="cancel">Cancel</button><button class="primary" id="save">Save</button></div></div>`
    const mark = document.createElement('div')
    mark.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #ffd400;background:#ffd40022;display:none'
    document.documentElement.append(host, mark)
    const $ = (id) => root.getElementById(id)
    let picking = false
    let picked = null

    const describe = (el) => {
      const roles = { BUTTON: 'button', A: 'link', INPUT: 'textbox', TEXTAREA: 'textbox', SELECT: 'combobox', IMG: 'img', H1: 'heading', H2: 'heading', H3: 'heading' }
      const role = el.getAttribute('role') || (el.tagName === 'INPUT' && ['checkbox', 'radio'].includes(el.type) ? el.type : roles[el.tagName]) || el.tagName.toLowerCase()
      const labelled = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      const name = (el.getAttribute('aria-label') || labelled?.innerText || el.innerText || el.getAttribute('alt') || el.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 80)
      const path = []
      for (let n = el; n && n.nodeType === 1 && path.length < 5; n = n.parentElement) {
        if (n.id) { path.unshift(`#${CSS.escape(n.id)}`); break }
        const test = n.getAttribute('data-testid')
        if (test) { path.unshift(`[data-testid="${test}"]`); break }
        const same = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : []
        path.unshift(n.tagName.toLowerCase() + (same.length > 1 ? `:nth-of-type(${same.indexOf(n) + 1})` : ''))
      }
      const r = el.getBoundingClientRect()
      return { role, name, selector: path.join(' > '), rect: { x: r.x, y: r.y, width: r.width, height: r.height } }
    }
    const inOverlay = (e) => e.composedPath().includes(host)
    const show = (el) => {
      const r = el.getBoundingClientRect()
      Object.assign(mark.style, { display: 'block', left: `${r.x}px`, top: `${r.y}px`, width: `${r.width}px`, height: `${r.height}px` })
    }

    $('go').onclick = () => {
      picking = true
      $('hint').textContent = 'Click the element. Esc cancels.'
    }
    document.addEventListener('mousemove', (e) => picking && !inOverlay(e) && show(e.target), true)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && picking) {
        picking = false
        mark.style.display = 'none'
        $('hint').textContent = 'Click "Comment", then an element.'
      }
    }, true)
    for (const type of ['pointerdown', 'mousedown', 'mouseup', 'click']) {
      document.addEventListener(type, (e) => {
        if (!picking || inOverlay(e)) return
        e.preventDefault()
        e.stopImmediatePropagation()
        if (type !== 'click') return
        picking = false
        picked = describe(e.target)
        show(e.target)
        $('target').textContent = `${picked.role} "${picked.name || picked.selector}"`
        $('box').style.display = 'flex'
        $('text').focus()
      }, true)
    }
    const close = () => {
      picked = null
      $('text').value = ''
      $('box').style.display = 'none'
      mark.style.display = 'none'
      $('hint').textContent = 'Click "Comment", then an element.'
    }
    $('cancel').onclick = close
    $('save').onclick = async () => {
      const text = $('text').value.trim()
      if (!text || !picked) return
      const item = { ...picked, text, route: location.pathname + location.search + location.hash, viewport: { width: innerWidth, height: innerHeight } }
      host.style.display = 'none'
      mark.style.display = 'none'
      const id = await window.uxCommentSave(item)
      host.style.display = ''
      close()
      $('hint').textContent = `Saved ${id}. Click "Comment" for the next one.`
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
}

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext({ viewport: null })
const written = []

await context.exposeBinding('uxCommentSave', async ({ page }, item) => {
  const id = `FB-${String(next++).padStart(3, '0')}`
  const pad = 24
  const vp = item.viewport
  const x = Math.max(0, item.rect.x - pad)
  const y = Math.max(0, item.rect.y - pad)
  const clip = { x, y, width: Math.max(1, Math.min(vp.width - x, item.rect.width + 2 * pad)), height: Math.max(1, Math.min(vp.height - y, item.rect.height + 2 * pad)) }
  const crop = join(cropDir, `${id}.png`)
  await page.screenshot({ path: crop, clip }).catch(() => page.screenshot({ path: crop }))
  const q = (s) => JSON.stringify(s)
  writeFileSync(
    join(roundDir, `${id}.md`),
    [
      '---',
      `id: ${id}`,
      'source: person',
      'from: comment mode',
      `round: ${round}`,
      'kind: <triage>',
      'severity: <triage>',
      'target:',
      '  plan: <triage>',
      `  screen: ${q(item.route)}`,
      '  state: <triage>',
      `  element: ${q(`${item.role} "${item.name}" (${item.selector})`)}`,
      'status: open',
      'closed-by:',
      '---',
      `# ${id} — ${item.text.split('\n')[0].slice(0, 60)}`,
      '',
      '## Feedback',
      '',
      ...item.text.split('\n').map((l) => `> ${l}`),
      '',
      '## Evidence',
      '',
      `- Crop: \`${crop}\` (viewport ${vp.width}×${vp.height}; scratch, not committed)`,
      `- Route: \`${item.route}\``,
      `- Element: ${item.role} "${item.name}", selector \`${item.selector}\``,
      '',
      '## Triage',
      '',
      '## Outcome',
      '',
    ].join('\n'),
  )
  written.push(`${id} ${item.route} ${item.role} "${item.name}" — ${item.text.split('\n')[0].slice(0, 80)}`)
  return id
})
await context.addInitScript(overlay)

const page = await context.newPage()
await page.goto(url)

// Wait until the person closes the window.
await new Promise((done) => {
  browser.on('disconnected', done)
  context.on('close', done)
  const check = () => context.pages().length === 0 && done()
  page.on('close', check)
  context.on('page', (p) => p.on('close', check))
})

await browser.close().catch(() => {})
console.log(written.length ? written.join('\n') : 'No comments saved.')
console.log(`${written.length} items → ${roundDir}`)
