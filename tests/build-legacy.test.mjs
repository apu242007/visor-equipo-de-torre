import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (...p) => readFileSync(path.join(root, ...p));
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const ORIGINAL_SHA256 = '5a40ef06dc12afc4a6c6aef6419188fd13e6c0a8f228336cc4bed4ab18d4b44b';

function build(...extra) {
  const out = path.join(mkdtempSync(path.join(tmpdir(), 'tacker-legacy-')), 'index.html');
  const r = spawnSync(process.execPath, ['scripts/build-legacy.mjs', '--out', out, ...extra], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  return readFileSync(out);
}

test('el original en reference/legacy/ sigue inmutable', () => {
  assert.equal(sha256(read('reference', 'legacy', 'TACKER10_Digital_Rig_V2.html')), ORIGINAL_SHA256);
});

test('public/legacy es exactamente el build actual (sin edición manual)', () => {
  const fresh = sha256(build());
  assert.equal(sha256(read('public', 'legacy', 'TACKER10_Digital_Rig_V2.html')), fresh, 'public/legacy desactualizado');
});

test('el build inyecta los hooks, el runtime y los datos DROPS validados', () => {
  const html = build().toString('utf8');
  assert.match(html, /runPre\(\{Ot:Ot/);
  assert.match(html, /runPost\(window\.__rig\)/);
  assert.match(html, /<script id="tacker-ext">/);
  assert.match(html, /window\.__TACKER_DROPS=/);
  const data = JSON.parse(read('src', 'data', 'qhse', 'tacker10-drops.json'));
  assert.equal(data.points.length, 66);
  assert.ok(!html.includes('</script><script id="tacker-ext">'), 'el bloque de extensión debe ir antes del bundle');
});

test('--only limita los módulos incluidos y siempre entra el runtime', () => {
  const html = build('--only', 'none').toString('utf8');
  assert.match(html, /\/\* 00-runtime\.js \*\//);
  assert.doesNotMatch(html, /\/\* 20-mast\.js \*\//);
});

test('los módulos legacy-ext son JavaScript válido', () => {
  const files = readdirSync(path.join(root, 'legacy-ext')).filter((f) => /^\d\d-.*\.js$/.test(f));
  assert.ok(files.length >= 5);
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', path.join('legacy-ext', f)], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
});

test('la capa DROPS no dibuja radios ni distancias inventadas', () => {
  const layer = read('legacy-ext', '50-drops-layer.js').toString('utf8');
  assert.doesNotMatch(layer, /RingGeometry|CircleGeometry/);
  assert.match(layer, /no define radios ni distancias/);
});

test('60-ui-controls: sin cartel de modo y con botón para ocultar las barras de opciones', () => {
  const html = build().toString('utf8');
  assert.match(html, /#v2-hud\{display:none!important\}/);
  assert.match(html, /opts-toggle/);
  assert.match(html, /body\.opts-hidden #cadbar/);
  assert.doesNotMatch(html, /body\.opts-hidden #cad-inspector/);
  assert.match(html, /#cad-inspector\.collapsed\{transform:translateX\(/);
  assert.match(html, /inspector-toggle/);
});
