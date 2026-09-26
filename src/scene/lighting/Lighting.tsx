import { ContactShadows, Environment, Lightformer } from '@react-three/drei'

/**
 * Iluminación PBR sin HDRI remoto: entorno procedural con Lightformers + una luz direccional
 * con sombra. Los HDRI reales irán en public/environments/ cuando existan.
 */
export function Lighting() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 8, 0]}
          rotation-x={Math.PI / 2}
          scale={[20, 20, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1}
          position={[-12, 4, 6]}
          rotation-y={Math.PI / 2}
          scale={[10, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.6}
          position={[12, 3, -6]}
          rotation-y={-Math.PI / 2}
          scale={[10, 6, 1]}
        />
      </Environment>
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
