---
name: performance-review
description: Use when reviewing or optimizing rendering/bundle performance of the viewer — draw calls, triangles, textures, shadows, postprocessing, bundle size, frame time, memory leaks — or before enabling an expensive visual effect, or when porting geometry from the legacy viewer.
---

# performance-review

Medir antes de optimizar. No activar efectos costosos por estética.

## Línea base y objetivo

V2 rediseñado (piso a no empeorar): 366 draw calls, ~94 k triángulos, logrado fusionando por material; se mide con el pie del visor ("N llamadas", triángulos) o `renderer.info`. Objetivo del motor nativo: <300 draw calls y <1,5 M tris. El V2 original (~890–982 draw calls porque cada barra de reticulado/cable/caño era un mesh, render continuo, `preserveDrawingBuffer:true` permanente; ver `docs/legacy-audit-2026-09-25.md`) es lo que la app nueva debe superar.

## Checklist

1. **Draw calls / triángulos**: `renderer.info.render` (calls, triangles). Objetivo: <300 calls, <1,5 M tris en escritorio. Reticulados, cables y tuberías: fusionar por material dentro de cada componente o `InstancedMesh`; nunca fusionar entre componentes (rompe selección). Simplificar solo componentes C; no degradar componentes A sin decisión.
2. **Texturas**: máx. 2048 salvo justificación; comprimir (webp/KTX2). VRAM ≈ ancho × alto × 4 × 1,33.
3. **Sombras**: un solo `directionalLight` con sombra, mapa 2048, cámara de sombra acotada al rig (±40 m, near 1, far 150); `PCFShadowMap` (PCFSoft deprecado); `ContactShadows frames={1}`.
4. **Postprocessing**: preferir `emissive` para hover/selección; Outline solo si hace falta y solo sobre la selección; sin SSAO/bloom permanentes.
5. **Render bajo demanda**: escena estática → `frameloop="demand"` + `invalidate()` al interactuar, animar (aparejo, transiciones de cámara) o cambiar estado. El legacy renderiza a 60 fps siempre.
6. **Captura PNG**: renderizar + `toBlob` en el mismo tick; no dejar `preserveDrawingBuffer` activo.
7. **Etiquetas HTML** (cotas, nombres, medición): reproyectar como máximo cada 2 frames y ocultar las fuera de frustum o del rango [−1,1] en z.
8. **Raycast**: lista de pickables precalculada; `recursive=false`; throttle del hover. BVH solo si se mide como cuello.
9. **Bundle**: three/r3f/drei van en el chunk lazy `Viewport`; revisar `npm run build` (aviso >900 kB). Importar por ruta (`three/examples/jsm/...`).
10. **Memoria**: `dispose()` al desmontar; los materiales clonados por componente (para emissive) se liberan con el componente; vigilar `renderer.info.memory`.
11. **LOD / culling**: LOD solo para repetidos o lejanos; no desactivar `frustumCulled`.
12. **Regresión**: anotar frame time, draw calls y triángulos antes/después en el PR.
13. **Reconocibilidad**: no reducir la reconocibilidad de componentes críticos (mástil, aparejo, malacate, BOP, llave, vientos) solo para bajar polígonos; simplificar primero componentes C, instancing o fusión por material.
14. **Trade-offs**: documentar cada compromiso (qué se perdió, qué se ganó, cifras antes/después) en el PR o en `docs/`.

## Herramientas

`npm run build` (tamaños), `npm run gltf:inspect` (tris/texturas), Chrome Performance, `renderer.info`. El legacy muestra "N llamadas" y triángulos en su barra inferior: comparar contra eso.
