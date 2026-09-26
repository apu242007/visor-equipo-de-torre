import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../public/legacy/TACKER10_Digital_Rig_V2.html', import.meta.url), 'utf8');

test('TACKER10 HTML is self-contained (opens by double-click, no server or network)', () => {
  assert.doesNotMatch(html, /<script[^>]+\bsrc=/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i);
  assert.doesNotMatch(html, /\bfetch\(|XMLHttpRequest|import\(/);
});

test('TACKER10 HTML keeps its core controls and modes', () => {
  for (const id of ['t-explode', 't-labels', 't-zones', 'c-measure', 'c-cut', 'c-png', 'c-glb']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const mode of ['explore', 'operation', 'qhse', 'training']) {
    assert.match(html, new RegExp(`data-m=["']${mode}["']`));
  }
});

test('TACKER10 HTML does not use the deprecated PCFSoftShadowMap', () => {
  assert.match(html, /shadowMap\.type=1;/);
  assert.doesNotMatch(html, /shadowMap\.type=Mo;/);
});

test('TACKER10 HTML accepts the embedded-mode bridge from the host app', () => {
  assert.match(html, /has\('embedded'\)/);
  assert.match(html, /tacker:setMode/);
  assert.match(html, /e\.source!==window\.parent/);
});

test('double-click launcher opens the HTML directly', async () => {
  const cmd = await readFile(new URL('../ABRIR_TACKER10_DIGITAL_RIG.cmd', import.meta.url), 'utf8');
  assert.match(cmd, /TACKER10_Digital_Rig_V2\.html/);
  assert.match(cmd, /%~dp0/);
});
