import type { WebGLRenderer } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

// Decodificadores servidos localmente desde public/decoders (sin CDN externo).
// Se refrescan con `npm run assets:decoders` cuando se actualiza `three`.
const base = import.meta.env.BASE_URL

let draco: DRACOLoader | undefined
let ktx2: KTX2Loader | undefined

/** Habilita Draco + Meshopt + KTX2 en un GLTFLoader. Los loaders auxiliares se reutilizan. */
export function configureGltfLoader(loader: GLTFLoader, renderer: WebGLRenderer): void {
  draco ??= new DRACOLoader().setDecoderPath(`${base}decoders/draco/`)
  ktx2 ??= new KTX2Loader().setTranscoderPath(`${base}decoders/basis/`)
  ktx2.detectSupport(renderer)

  loader.setDRACOLoader(draco)
  loader.setKTX2Loader(ktx2)
  loader.setMeshoptDecoder(MeshoptDecoder)
}
