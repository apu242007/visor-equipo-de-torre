// Uso: npm run gltf:inspect -- <archivo.glb>
// Solo lectura: imprime escenas, meshes, materiales, texturas, extensiones y tamaños.
import path from 'node:path'
import { projectRoot, runGltfTransform } from './_gltf-cli.mjs'

const [input] = process.argv.slice(2)
if (!input) {
  console.error('Uso: npm run gltf:inspect -- <archivo.glb|gltf>   (p. ej. assets/source/mast.glb)')
  process.exit(1)
}

runGltfTransform(['inspect', path.resolve(projectRoot, input)])
