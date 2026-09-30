import { ContactShadows, Environment } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { createSkyTexture } from './sky'

/**
 * Iluminación PBR sin HDRI remoto: cielo procedural (canvas equirectangular → PMREM vía <Environment map>)
 * + una luz direccional con sombra. Los HDRI reales irán en public/environments/ cuando existan.
 */
export function Lighting() {
  const sky = useMemo(() => createSkyTexture(), [])
  useEffect(() => () => sky.dispose(), [sky])
  return (
    <>
      <Environment map={sky} environmentIntensity={0.9} />
      <directionalLight
        castShadow
        intensity={1.6}
        position={[18, 30, 12]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0005}
      />
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.5}
        scale={60}
        blur={2.5}
        far={12}
        frames={1}
      />
    </>
  )
}
