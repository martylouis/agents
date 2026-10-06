// Plugin text size: bytes and estimated tokens (bytes / 4) for each skill, agent, shared
// file, and template, with the files that mention each one. Makes no API calls.
//
// Usage: node size.mjs [--top N]     (any cwd; the plugin root is two folders above this script)
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const topArg = process.argv.indexOf('--top')
const top = topArg < 0 ? Infinity : Number(process.argv[topArg + 1]) || Infinity

const list = (dir, test) =>
  existsSync(join(root, dir)) ? readdirSync(join(root, dir)).filter(test).map((f) => join(dir, f)) : []
const md = (f) => f.endsWith('.md')

const skills = list('skills', (f) => existsSync(join(root, 'skills', f, 'SKILL.md'))).map((d) => join(d, 'SKILL.md'))
const files = [
  ...skills,
  ...list('agents', md),
  ...list('shared', md),
  ...list(join('shared', 'templates'), md),
].map((path) => ({ path, text: readFileSync(join(root, path), 'utf8') }))

// What another file writes when it points at this one.
function needle(path) {
  const name = basename(path)
  if (name === 'SKILL.md') return `/proto:${basename(dirname(path))}`
  if (path.startsWith('agents')) return name.replace('.md', '')
  if (path.includes('templates')) return `templates/${name}`
  return name
}

const rows = files.map(({ path, text }) => {
  const users = files
    .filter((o) => o.path !== path && o.text.includes(needle(path)))
    .map((o) => (basename(o.path) === 'SKILL.md' ? basename(dirname(o.path)) : basename(o.path)))
  const bytes = Buffer.byteLength(text)
  return { path, bytes, tokens: Math.round(bytes / 4), users }
})
rows.sort((a, b) => b.bytes - a.bytes)

console.log('bytes  ~tokens  file  [mentioned in]')
for (const r of rows.slice(0, top)) {
  console.log(`${String(r.bytes).padStart(5)}  ${String(r.tokens).padStart(7)}  ${r.path}  [${r.users.join(', ')}]`)
}
const total = rows.reduce((s, r) => s + r.bytes, 0)
console.log(`${String(total).padStart(5)}  ${String(Math.round(total / 4)).padStart(7)}  total (${rows.length} files)`)
