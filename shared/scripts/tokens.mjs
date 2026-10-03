// Design tokens: list the tokens in a file, or compare prototype overrides with the base design system.
//
// Usage: node tokens.mjs list <file>
//        node tokens.mjs diff <overrides file> <base file> [more base files]
//
// Formats:
//   .json         W3C Design Tokens (DTCG): nested groups, tokens have "$value". Plain "value" also works.
//   .css .scss    Custom properties (--name: value;). A token inside a selector or at-rule
//                 that contains "dark" gets the key "<name> (dark)".
//
// diff prints one line per override: status, key, override value, base value.
//   same          the base has the same value (the base adopted the override)
//   differs       the base has a different value (an open proposal, or a conflict)
//   not-in-base   the base has no such token
// Exit code 0. Values are compared as text after trimming and collapsing spaces.
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'

function fromJson(obj, path = [], out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue
    if (v && typeof v === 'object' && ('$value' in v || 'value' in v)) {
      const value = v.$value ?? v.value
      out.set([...path, k].join('.'), typeof value === 'string' ? value : JSON.stringify(value))
    } else if (v && typeof v === 'object') fromJson(v, [...path, k], out)
  }
  return out
}

function fromCss(text, out = new Map()) {
  text = text.replace(/\/\*[\s\S]*?\*\//g, '')
  const stack = []
  let buf = ''
  for (const ch of text) {
    if (ch === '{') {
      stack.push(buf.trim())
      buf = ''
    } else if (ch === '}') {
      take(buf)
      stack.pop()
      buf = ''
    } else if (ch === ';') {
      take(buf)
      buf = ''
    } else buf += ch
  }
  function take(decl) {
    const m = decl.trim().match(/^(--[\w-]+)\s*:\s*([\s\S]+)$/)
    if (!m) return
    const dark = stack.some((s) => /dark/i.test(s))
    out.set(m[1] + (dark ? ' (dark)' : ''), m[2])
  }
  return out
}

function load(file) {
  const text = readFileSync(file, 'utf8')
  return extname(file) === '.json' ? fromJson(JSON.parse(text)) : fromCss(text)
}

const norm = (v) => String(v).trim().replace(/\s+/g, ' ')

const [cmd, file, ...bases] = process.argv.slice(2)
if (cmd === 'list' && file) {
  for (const [k, v] of load(file)) console.log(`${k}\t${norm(v)}`)
} else if (cmd === 'diff' && file && bases.length) {
  const base = new Map()
  for (const b of bases) for (const [k, v] of load(b)) base.set(k, v)
  const counts = { same: 0, differs: 0, 'not-in-base': 0 }
  for (const [k, v] of load(file)) {
    const status = !base.has(k) ? 'not-in-base' : norm(base.get(k)) === norm(v) ? 'same' : 'differs'
    counts[status]++
    console.log(`${status}\t${k}\t${norm(v)}\t${base.has(k) ? norm(base.get(k)) : '-'}`)
  }
  console.log(`# ${counts.same} same, ${counts.differs} differs, ${counts['not-in-base']} not-in-base`)
} else {
  console.error('Usage: node tokens.mjs list <file>\n       node tokens.mjs diff <overrides file> <base file> [more base files]')
  process.exit(1)
}
