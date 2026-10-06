// Scratch cleanup: keep the newest run folders in docs/ux/.scratch/ and trash the rest.
//
// Usage: node scratch-clean.mjs [--dry-run]     (cwd = prototype root)
//
// Reads `scratch:` from docs/ux/PLANS.md → Run settings: keep-last-<N> (default keep-last-3)
// or keep-all. Folders sort by the date in the name, then the -2/-3 suffix, then the
// modified time. A feedback-r<N> folder stays while docs/ux/HISTORY.md has an open,
// triaged, or building row in round N. A folder whose name ends in -legacy is always kept
// and is not counted in the newest N. Prints each folder with keep or delete and the reason.
// Deletes with `trash`; it never falls back to rm.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const dryRun = process.argv.includes('--dry-run')
const scratch = join('docs', 'ux', '.scratch')
const DEFAULT = 'keep-last-3'

if (!existsSync(scratch)) {
  console.log('No docs/ux/.scratch/ folder: nothing to clean.')
  process.exit(0)
}

function setting() {
  const file = join('docs', 'ux', 'PLANS.md')
  const value = existsSync(file)
    ? readFileSync(file, 'utf8').match(/^scratch:\s*(\S+)/m)?.[1]
    : undefined
  if (value && (value === 'keep-all' || /^keep-last-\d+$/.test(value))) return value
  if (value) console.warn(`Unknown scratch setting "${value}"; using ${DEFAULT}.`)
  return DEFAULT
}

// Rounds with a row that is still open: | FB-004 | 2 | "text" | building | ... |
function openRounds() {
  const file = join('docs', 'ux', 'HISTORY.md')
  const rounds = new Set()
  if (!existsSync(file)) return rounds
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*FB-\d+\s*\|\s*(\w+)\s*\|.*\|\s*(open|triaged|building)\s*\|[^|]*\|\s*$/)
    if (m) rounds.add(m[1])
  }
  return rounds
}

function size(path) {
  const st = statSync(path)
  if (!st.isDirectory()) return st.size
  return readdirSync(path).reduce((sum, f) => sum + size(join(path, f)), 0)
}
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`

function sortKey(name) {
  const date = name.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ?? ''
  const suffix = Number(name.match(/-(\d+)$/)?.[1] ?? 1)
  return { name, date, suffix, mtime: statSync(join(scratch, name)).mtimeMs }
}

const mode = setting()
const dirs = readdirSync(scratch, { withFileTypes: true }).filter((d) => d.isDirectory())
const legacy = dirs.filter((d) => d.name.endsWith('-legacy')).map((d) => d.name)
const folders = dirs
  .filter((d) => !d.name.endsWith('-legacy'))
  .map((d) => sortKey(d.name))
  .sort((a, b) => b.date.localeCompare(a.date) || b.suffix - a.suffix || b.mtime - a.mtime)

for (const name of legacy) {
  console.log(`${'keep'.padEnd(6)} ${name} (${mb(size(join(scratch, name)))}) — legacy records`)
}

if (mode === 'keep-all') {
  console.log(`scratch: keep-all. ${folders.length} folders, ${mb(folders.reduce((s, f) => s + size(join(scratch, f.name)), 0))}. Nothing deleted.`)
  process.exit(0)
}

const limit = Number(mode.replace('keep-last-', ''))
const open = openRounds()
let kept = 0
let removed = 0
let keptBytes = 0
let removedBytes = 0

folders.forEach((f, i) => {
  const bytes = size(join(scratch, f.name))
  const round = f.name.match(/-feedback-r(\d+)(?:-\d+)?$/)?.[1]
  let verdict = 'keep'
  let reason = `among the newest ${limit}`
  if (i >= limit) {
    if (round && open.has(round)) reason = `round ${round} has open items in HISTORY.md`
    else {
      verdict = 'delete'
      reason = `older than the newest ${limit}`
    }
  }
  console.log(`${verdict.padEnd(6)} ${f.name} (${mb(bytes)}) — ${reason}`)
  if (verdict === 'keep') {
    kept++
    keptBytes += bytes
    return
  }
  removed++
  removedBytes += bytes
  if (!dryRun) execFileSync('trash', [join(scratch, f.name)])
})

console.log(
  `${dryRun ? 'Dry run, nothing deleted. ' : ''}Keep ${kept} (${mb(keptBytes)}), delete ${removed} (${mb(removedBytes)}).`
)
