// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { simularDaltonismo } from './logica.js';

const ROJO = new Uint8ClampedArray([255, 0, 0, 200]);

describe('DIS-07 simularDaltonismo', () => {
  test('la acromatopsia produce grises', () => {
    const [rojo, verde, azul] = simularDaltonismo(ROJO, 'acromatopsia');
    assert.equal(rojo, verde);
    assert.equal(verde, azul);
  });

  test('la protanopía reduce el rojo puro', () => {
    assert.ok(simularDaltonismo(ROJO, 'protanopia')[0] < 255);
  });

  test('conserva la transparencia', () => {
    assert.equal(simularDaltonismo(ROJO, 'tritanopia')[3], 200);
  });

  test('no modifica los píxeles originales', () => {
    simularDaltonismo(ROJO, 'deuteranopia');
    assert.deepEqual([...ROJO], [255, 0, 0, 200]);
  });

  test('el blanco se mantiene blanco en todos los tipos', () => {
    for (const tipo of ['protanopia', 'deuteranopia', 'tritanopia', 'acromatopsia']) {
      const blanco = new Uint8ClampedArray([255, 255, 255, 255]);
      assert.deepEqual([...simularDaltonismo(blanco, tipo)], [255, 255, 255, 255]);
    }
  });
});
