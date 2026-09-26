import { OrbitControls } from '@react-three/drei'
import { CAMERA_PRESETS, DEFAULT_CAMERA_PRESET } from '@/scene/cameras/presets'

/** Órbita con límites: no baja del terreno y acota el zoom a la escala de un equipo (~32 m de mástil). */
export function CameraRig() {
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.09}
      target={[...CAMERA_PRESETS[DEFAULT_CAMERA_PRESET].target]}
      minDistance={3}
      maxDistance={160}
      maxPolarAngle={Math.PI / 2}
    />
  )
}
