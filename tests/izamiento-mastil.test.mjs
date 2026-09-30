// Izamiento del mástil ilustrativo (legacy-ext/81) y cabina desmontable (legacy-ext/79): entran en el HTML, declaran su fuente
// (usuario, pendingValidation), no inventan cargas/tiempos y el módulo del mástil deja el visor igual en 100 %.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const root = path.resolve(import.meta.dirname, '..')
const html = fs.readFileSync(path.join(root, 'public', 'legacy', 'TACKER10_Digital_Rig_V2.html'), 'utf8')
const erect = fs.readFileSync(path.join(root, 'legacy-ext', '81-izamiento-mastil.js'), 'utf8')
const cab = fs.readFileSync(path.join(root, 'legacy-ext', '79-cabina-desmontable.js'), 'utf8')
const mast = fs.readFileSync(path.join(root, 'legacy-ext', '20-mast.js'), 'utf8')

test('módulos en el HTML generado y API expuesta', () => {
  for (const m of ['79-cabina-desmontable.js', '81-izamiento-mastil.js']) assert.ok(html.includes(`/* ${m} */`), m)
  assert.ok(html.includes('__tackerErect') && html.includes('__tackerCabina'))
})

test('la secuencia del izamiento respeta lo indicado: 3 fases en orden', () => {
  const f = erect.indexOf('Fase 1'), g = erect.indexOf('Fase 2'), h = erect.indexOf('Fase 3')
  assert.ok(f > 0 && g > f && h > g)
  assert.match(erect, /pistón de izaje del 1\.er tramo/)
  assert.match(erect, /extiende el tramo embutido/)
  assert.match(erect, /se tensan los vientos/)
})

test('se declara ilustrativo, de fuente usuario y pendiente de validar', () => {
  assert.match(erect, /pendingValidation/)
  assert.match(erect, /NO es una simulación/)
  assert.match(cab, /pendingValidation/)
  assert.match(cab, /desmontable/)
})

test('los pistones de izaje son un grupo propio en el mástil (para sustituirlos al animar)', () => {
  assert.ok(mast.includes("gp.name = 'pistones_izaje'"))
  assert.ok(!mast.includes("W.line(M.red, D(-5, 1.45, s)"), 'ya no van mezclados con las ménsulas de la base')
})

test('no hay cargas, presiones ni tiempos reales en los textos de la UI', () => {
  const note = erect.match(/er-note">([^<]+)</)[1]
  assert.ok(!/\b\d+\s*(kg|t|psi|bar|s|min|h)\b/.test(note), note)
})
