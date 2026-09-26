// Captura headless del visor con el Chrome instalado (playwright-core, sin descargar navegadores).
// Cada invocación abre su PROPIA instancia: se puede usar en paralelo desde varios procesos.
//
//   node scripts/snap.mjs --file .tmp/x/index.html --out .tmp/x/a.png [--w 1440 --h 900] [--wait 2500]
//        [--eval "js que corre en la página antes de la captura"] [--click "selector"]...
//        [--eval-out "expr"]   imprime el resultado JSON de evaluar `expr` (después de --eval/--click)
//
// --file sirve el directorio del archivo por HTTP local efímero (los HTML usan blobs/módulos).
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright-core'

const args = process.argv.slice(2)
const val = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d)
const all = (f) => args.flatMap((a, i) => (a === f ? [args[i + 1]] : []))

const file = val('--file')
const url = val('--url')
const out = val('--out', '.tmp/snap.png')
const w = Number(val('--w', 1440))
const h = Number(val('--h', 900))
const wait = Number(val('--wait', 2500))
if (!file && !url) {
  console.error('Uso: --file <html> | --url <url>  --out <png>')
  process.exit(1)
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}
let server
let target = url
if (file) {
  const abs = path.resolve(file)
  const dir = path.dirname(abs)
  server = http.createServer((req, res) => {
    const p = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (!p.startsWith(dir) || !fs.existsSync(p) || fs.statSync(p).isDirectory())
      return void res.writeHead(404).end()
    res.writeHead(200, { 'content-type': mime[path.extname(p)] ?? 'application/octet-stream' })
    fs.createReadStream(p).pipe(res)
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  target = `http://127.0.0.1:${server.address().port}/${path.basename(abs)}`
}

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
})
const page = await browser.newPage({ viewport: { width: w, height: h } })
const problems = []
page.on(
  'console',
  (m) => ['error', 'warning'].includes(m.type()) && problems.push(`[${m.type()}] ${m.text()}`),
)
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))

await page.goto(target, { waitUntil: 'load' })
await page.waitForTimeout(wait)
const ev = val('--eval')
if (ev) await page.evaluate(ev)
for (const sel of all('--click')) {
  await page.click(sel)
  await page.waitForTimeout(400)
}
if (ev || all('--click').length) await page.waitForTimeout(600)
const evOut = val('--eval-out')
if (evOut) console.log('eval-out:', JSON.stringify(await page.evaluate(evOut), null, 1))

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
await page.screenshot({ path: out })
console.log('captura:', out, `(${w}x${h})`)
console.log(problems.length ? 'consola:\n' + problems.join('\n') : 'consola: sin errores ni avisos')
await browser.close()
server?.close()
