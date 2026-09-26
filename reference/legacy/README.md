# reference/legacy — evidencia inmutable

Esta carpeta conserva los visores HTML legacy **tal como se recibieron**. Es evidencia de referencia
para la migración al visor nativo (React + R3F): **nunca se edita, reformatea ni regenera**. Cualquier
cambio va en la copia runtime generada (`public/legacy/`, ver `scripts/build-legacy.mjs`).

## Archivos

| Archivo                                 | Qué es                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TACKER10_Digital_Rig_V2.html`          | Visor V2 autocontenido (HTML + three.js embebido). Referencia funcional de la migración (ver `docs/legacy-audit-2026-09-25.md` y `docs/FEATURE_PARITY.md`).  |
| `Visor_Torre_Pulling_TACKER10_CAD.html` | Visor técnico 3D previo (three.js r184, geometría procedural aproximada, no es un sólido CAD). Auditado en `docs/references/visor-tacker10-cad-audit.md`.    |
| `SHA256SUMS.txt`                        | Hashes SHA-256 de los HTML de esta carpeta (`hash  nombre`, minúsculas). Verificar con `Get-FileHash -Algorithm SHA256` o `sha256sum -c` desde esta carpeta. |

## Relación con las otras copias

- `public/legacy/TACKER10_Digital_Rig_V2.html` es la copia de trabajo, **generada** por
  `npm run build:legacy` a partir de este original (no se edita a mano); la app la embebe en un iframe y
  `ABRIR_TACKER10_DIGITAL_RIG.cmd` la abre con doble clic. Difiere en: `shadowMap.type=1`
  (`PCFShadowMap`) en lugar de `PCFSoftShadowMap`, deprecado en three 0.186; un favicon inline; un puente de
  modo embebido (con `?embedded` oculta la barra de modos propia y acepta `postMessage` `tacker:setMode`
  solo desde `window.parent`); los hooks `runPre`/`runPost`; y los módulos `legacy-ext/` (rediseño de
  mástil, carrier y locación, capa DROPS) más el bloque de datos `window.__TACKER_DROPS`. Lo abre `ABRIR_TACKER10_DIGITAL_RIG.cmd` y lo cubren los tests
  `tests/*.test.mjs`.
- `public/legacy/TACKER10_Digital_Rig_V2.html` es la copia runtime que la app embebe en un iframe
  mientras el motor R3F nativo no tenga paridad verificada.
- Este directorio conserva el original **sin ningún cambio**.

## Verificación

```
cd reference/legacy
sha256sum -c SHA256SUMS.txt
```

Hash esperado de `TACKER10_Digital_Rig_V2.html`:
`5a40ef06dc12afc4a6c6aef6419188fd13e6c0a8f228336cc4bed4ab18d4b44b`.
