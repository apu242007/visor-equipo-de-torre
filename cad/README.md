# cad/ — modelado paramétrico (CadQuery) de TACKER DIGITAL RIG

Flujo estilo SolidWorks (variables → ecuaciones → operaciones → verificación → export) con la skill
`diseno-cad-solidworks`. Las cotas salen de `reference/v2-previo/src/technical-spec.js` (fuente única,
se leen con `node`); no se duplican en Python.

```
python -m venv %USERPROFILE%\cad-env && %USERPROFILE%\cad-env\Scripts\pip install -r cad/requirements.txt
%USERPROFILE%\cad-env\Scripts\python cad/build.py      # genera y verifica; exit 1 si una cota no cierra
npm run gltf:inspect -- assets/source/mastil.glb        # revisar antes de optimizar
npm run gltf:optimize -- mastil.glb                     # → public/models/tacker10/ (decisión aparte)
```

## Convenciones

- **1 unidad = 1 m**. CAD: Z arriba, +X hacia el mástil, Y lateral. El export pasa a glTF Y-arriba.
- Contrato `gltf-pipeline`: nodo raíz = id del componente, mallas `<id>_<parte>`, materiales `<id>_<rol>`.
- Salida en `assets/source/` (ignorada por git) junto a `<id>.meta.json`: confianza, alcance, datos con
  `status` (`confirmed` con `sourceId` / `pending`) y conflictos de fuente.
- Cada operación pasa por `Arbol` (cambia el volumen y deja un sólido válido). `build.py` verifica las
  cotas contra el spec, regenera las configuraciones y comprueba los nombres del GLB.

## Componentes actuales (confianza C — envolventes, no as-built)

| Componente       | Qué es                                          | Dato documentado                                              | Pendiente                                                             |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `mastil`         | 2 tramos macizos                                | 31,6992 m = 16,4 + 15,2992                                    | secciones transversales (placeholder), reticulado                     |
| `piso_trabajo`   | placa a altura regulable                        | 2,6 × 3,3 m, rango 1–4 m                                      | espesor (placeholder); **conflicto**: spec 3 m vs legacy 2,30 m       |
| `carrier_huella` | huella en planta                                | 18 × 4 m, 5 ejes (dato)                                       | altura, ejes, posición vs boca de pozo (layout TKR-10)                |
| `layout_tkr10`   | huellas de acumulador, bomba, pileta, planchada | tamaños y cotas rotuladas del layout TKR-10 (5 m, 3 m, 1,3 m) | posiciones no acotadas (medidas del vector del PDF, C); signo lateral |

Estos GLB **no reemplazan** al visor legacy (más detallado): sirven de envolvente dimensional verificable
y de base para auditar las cotas del legacy. No se registran en `Component.model` hasta validarlos.

## Ejemplos

`examples/choke_manifold_ilustrativo/`: choke manifold genérico reconstruido de una imagen de proveedor.
**No es Tacker 10**, escala PENDIENTE (unidades = px), IoU 0,58. Solo ilustrativo; no usar en el visor.

## Próximos candidatos (necesitan dato fuente)

BOP (7-1/16" 5000 psi: falta stack y alturas), acumulador (5 botellas), módulos de layout (12×2,4;
6×2,4; 12×2,4; 8×2,4: falta su ubicación en TKR-10), choke manifold real de Tacker 10.
