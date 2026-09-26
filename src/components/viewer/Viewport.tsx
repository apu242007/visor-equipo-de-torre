import { Canvas } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three'
import { Suspense } from 'react'
import { CAMERA_PRESETS, DEFAULT_CAMERA_PRESET } from '@/scene/cameras/presets'
import { CameraRig } from '@/scene/controls/CameraRig'
import { Lighting } from '@/scene/lighting/Lighting'
import { RigModel } from '@/scene/loaders/RigModel'

interface ViewportProps {
  /** URLs de GLB a cargar. Vacío = escena de referencia (grilla 1 m). */
  modelUrls?: readonly string[]
}

export function Viewport({ modelUrls = [] }: ViewportProps) {
  return (
    <Canvas
      role="img"
      aria-label="Escena 3D del equipo TACKER 10 (referencia digital, no as-built)"
      // Render bajo demanda (escena estática): drei invalida en cada 'change' de OrbitControls,
      // y el damping sigue solo porque cada update() emite 'change' hasta asentarse. r3f invalida
      // al montar/cambiar props; cualquier animación futura debe llamar invalidate().
      frameloop="demand"
      shadows={{ type: PCFShadowMap }}
      dpr={[1, 2]}
      camera={{
        position: [...CAMERA_PRESETS[DEFAULT_CAMERA_PRESET].position],
        fov: 42,
        near: 0.1,
        far: 600,
      }}
      gl={{
        antialias: true,
        outputColorSpace: SRGBColorSpace,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
    >
      <color attach="background" args={['#0b0d12']} />
      <Lighting />
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        sectionSize={10}
        sectionThickness={1}
        fadeDistance={90}
        infiniteGrid
        cellColor="#2a2f3a"
        sectionColor="#4b5566"
      />
      <Suspense fallback={null}>
        {modelUrls.map((url) => (
          <RigModel key={url} url={url} />
        ))}
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
