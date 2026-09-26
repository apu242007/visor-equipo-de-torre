// Refresca public/decoders/ desde la versión instalada de `three` (Draco + KTX2/Basis).
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const libs = path.join(root, 'node_modules', 'three', 'examples', 'jsm', 'libs')
const jobs = [
  [path.join(libs, 'draco', 'gltf'), path.join(root, 'public', 'decoders', 'draco')],
  [path.join(libs, 'basis'), path.join(root, 'public', 'decoders', 'basis')],
]

for (const [from, to] of jobs) {
  fs.mkdirSync(to, { recursive: true })
  for (const file of fs.readdirSync(from)) {
    if (file.endsWith('.md')) continue
    fs.copyFileSync(path.join(from, file), path.join(to, file))
  }
}
console.log('Decoders actualizados en public/decoders/')
