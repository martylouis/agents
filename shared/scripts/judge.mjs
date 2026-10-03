// Judge slot: sends one TypeSafe System One request and prints the answers.
// Usage: node judge.mjs <request.json> [out.json]
//        node judge.mjs --check      exit 0 when a key is available, 2 when not
// Run it with the prototype root as cwd. The request file holds { state, questions };
// the model defaults to jev-latest. The API key comes from TYPESAFE_API_KEY
// (environment, or the .env file in the cwd). It is never printed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadKey() {
  if (process.env.TYPESAFE_API_KEY) return process.env.TYPESAFE_API_KEY
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return undefined
  const line = readFileSync(envPath, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('TYPESAFE_API_KEY='))
  return line?.slice('TYPESAFE_API_KEY='.length).trim().replace(/^["']|["']$/g, '')
}

const [requestPath, outPath] = process.argv.slice(2)
if (requestPath === '--check') {
  console.log(loadKey() ? 'judge: typesafe' : 'judge: self (no TYPESAFE_API_KEY)')
  process.exit(loadKey() ? 0 : 2)
}
if (!requestPath) {
  console.error('Usage: node judge.mjs <request.json> [out.json]')
  process.exit(1)
}

const key = loadKey()
if (!key) {
  console.error('TYPESAFE_API_KEY not found in env or .env')
  process.exit(1)
}

const request = JSON.parse(readFileSync(requestPath, 'utf8'))
const started = Date.now()
const res = await fetch('https://api.typesafe.ai/v1/systemone', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'jev-latest', ...request }),
})
const body = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error(`TypeSafe error ${res.status}: ${JSON.stringify(body)}`)
  process.exit(1)
}

const result = { latencyMs: Date.now() - started, ...body }
if (outPath) writeFileSync(outPath, JSON.stringify(result, null, 2))

// Compact view: one line per question.
for (const [id, a] of Object.entries(body.answers ?? {})) {
  const value =
    a.type === 'noul' ? `yes=${a.noul?.toFixed(2)}` :
    a.type === 'choice' ? `${a.choice} (conf ${a.confidence?.toFixed(2)})` :
    `score=${a.score?.toFixed(2)} (conf ${a.confidence?.toFixed(2)})`
  console.log(`${id}: ${value}`)
}
console.log(`latency ${result.latencyMs} ms, tokens in/out ${body.usage?.input_tokens}/${body.usage?.output_tokens}`)
