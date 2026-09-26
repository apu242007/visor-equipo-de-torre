// Componente 10 (sistema de circulación): pileta de ensayo con golpeador, pileta de acumulación (PENDIENTE), textos del panel y ficha.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'legacy', 'TACKER10_Digital_Rig_V2.html'), 'utf8');
const wellsite = fs.readFileSync(path.join(root, 'legacy-ext', '40-wellsite.js'), 'utf8');
const meta = fs.readFileSync(path.join(root, 'legacy-ext', '44-meta-circulacion.js'), 'utf8');

/** Texto de `buildCirculacion` (de su declaración hasta el registro `Ot`). */
const start = wellsite.indexOf('  function buildCirculacion(g, api) {');
const end = wellsite.indexOf('PRE: registro de componentes');
const circ = wellsite.slice(start, end);

test('el componente 10 se renombra y su función menciona golpeador y pileta de acumulación pendiente', () => {
  assert.ok(html.includes('name:"Sistema de circulación y piletas",family:"circulacion"'));
  assert.ok(!html.includes('name:"Sistema de circulaci\\xF3n"'));
  const i = html.indexOf('at.circulacion.funcion="');
  assert.ok(i > 0);
  const funcion = html.slice(i + 'at.circulacion.funcion="'.length, html.indexOf('";', i));
  assert.ok(funcion.includes("'golpeador'"));
  assert.ok(funcion.includes('mismo equipo, no otro adicional'));
  assert.ok(funcion.includes('dimensiones y ubicación PENDIENTES'));
  assert.ok(!funcion.includes('"'), 'la cadena de función no debe romper las comillas dobles del bundle');
});

test('los peligros nuevos se rotulan "referencia, pendiente de validación" (nunca requisitos)', () => {
  for (const h of ['Gas o vapores en el golpeador', 'Rebalse de la pileta', 'Ingreso a espacio confinado', 'Proyección de fluido a presión en cañerías']) {
    const i = html.indexOf(h);
    assert.ok(i > 0, h);
    assert.ok(html.slice(i, i + 200).includes('(referencia, pendiente de validación)'), h);
  }
  // los peligros originales siguen y los controles orientativos no se tocaron
  assert.ok(html.includes(String.raw`"Rotura de l\xEDneas de alta presi\xF3n"`));
  assert.ok(html.includes('Barandas en pasarelas de tanques'));
});

test('la ficha de confiabilidad sigue en B / Parcial y rotula lo nuevo como PENDIENTE', () => {
  assert.match(meta, /grade: 'B',\s*status: 'Parcial'/);
  assert.match(meta, /PENDIENTE: pileta de acumulación \(no figura en el LAYOUT/);
  assert.match(meta, /supuestos de referencia,\s*'\s*\+\s*'no dato/);
  assert.match(meta, /window\.__TACKER_META/);
  assert.match(meta, /tacker:boot/);
  assert.ok(html.includes('/* 44-meta-circulacion.js */'), 'el módulo debe estar en el HTML generado');
});

test('PILETA_ACUM es una constante parametrizada, coincide con la ficha y no invade la pileta de ensayo', () => {
  const m = circ.match(/const PILETA_ACUM = \{ cx: (-?[\d.]+), cz: (-?[\d.]+), L: ([\d.]+), W: ([\d.]+), H: ([\d.]+) \}/);
  assert.ok(m, 'PILETA_ACUM = { cx, cz, L, W, H }');
  const [cx, cz, L, W, H] = m.slice(1).map(Number);
  // dimensiones del mismo orden que la pileta de ensayo (12 × 2,4 m), sin declararlas dato
  assert.ok(L >= 8 && L <= 14 && W >= 2 && W <= 3 && H >= 1.5 && H <= 3);
  // pileta de ensayo: x −8…4, z −15,9…−13,5 (zc = −14,7) → separación mínima de 2 m en Z y patín/rodillos incluidos
  const zcEnsayo = -14.7;
  const gap = zcEnsayo - 1.2 - (cz + W / 2);
  assert.ok(gap >= 2, `separación entre piletas ${gap.toFixed(2)} m`);
  // la ficha repite los valores como texto (10 × 2,4 × 2,0 m en x −2 · z −19,4)
  const fmt = (v) => String(v).replace('.', ',').replace('-', '−');
  assert.ok(meta.includes(`${fmt(L)} × ${fmt(W)} × ${fmt(H.toFixed(1))} m en x ${fmt(cx)} · z ${fmt(cz)}`), 'la ficha no coincide con PILETA_ACUM');
  assert.ok(/PENDIENTES: dimensiones y ubicación|dimensiones y ubicación PENDIENTES/.test(html));
  assert.match(circ, /PENDIENTE: el LAYOUT TKR-10 NO la muestra/);
});

test('subconjuntos con nombre propio y mallas fusionadas por material (presupuesto de draw calls)', () => {
  for (const name of ['pileta_ensayo', 'golpeador', 'pileta_acumulacion']) assert.ok(circ.includes(`sub('${name}')`), name);
  const flushes = [...circ.matchAll(/\.flush\((\w+), m\.(\w+), '([^']+)'/g)].map((x) => x[3]);
  assert.deepEqual(
    flushes.sort(),
    [
      'PIL-1_luminarias',
      'PIL-2_barandas',
      'circulacion_acero',
      'circulacion_mangueras',
      'circulacion_pintura',
      'golpeador_pintura',
      'pileta_acumulacion_acero',
      'pileta_acumulacion_pintura',
      'pileta_ensayo_acero',
      'pileta_ensayo_pintura',
    ].sort(),
    'un mesh por material y subconjunto (línea base: 6 meshes → 10; +4 draw calls)',
  );
});

test('los grupos DROPS PIL-1 y PIL-2 se conservan', () => {
  assert.match(circ, /'PIL-2',\s*'Libro DROPS p\.21: baranda en tintero soldado/);
  assert.match(circ, /'PIL-1',\s*'Libro DROPS p\.21: luminarias/);
  assert.ok(circ.includes("'PIL-2_barandas'") && circ.includes("'PIL-1_luminarias'"));
});

test('el golpeador reemplaza al desgasificador anterior (no se duplica el equipo)', () => {
  assert.equal([...circ.matchAll(/sub\('golpeador'\)/g)].length, 1);
  assert.ok(!/2\.6, -4\.5, 1\.5, zc - 2\.2/.test(circ), 'el gas buster anterior (x −4,5 · z zc−2,2) no debe quedar');
});

test('lo documentado se conserva: pileta 12 × 2,4 m, cubicador Ø1,3 × 2,4 m, bomba y ruteo de cañerías', () => {
  assert.match(circ, /tank\(PE, TX, zc, 12, 2\.4, 2\.0\)/);
  assert.match(circ, /PE\.cyl\(C\.BLUE_L, 0\.65, 0\.65, 2\.4, cbx, 1\.4, zc/);
  assert.match(circ, /P\.box\(C\.SKID, 6, 0\.22, 2\.4, -13, 0\.11, zc\)/); // patín de la bomba 6 × 2,4 m
  assert.match(circ, /\[-10\.65, 0\.9, zc\],\s*\[-9\.2, 0\.9, zc\],\s*\[-9\.2, 0\.5, zc\],\s*\[-9\.2, 0\.5, -12\.9\]/); // línea de matar
  assert.match(circ, /\[3\.0, 1\.25, -13\.5\]/); // llegada de la línea D a la pileta
});
