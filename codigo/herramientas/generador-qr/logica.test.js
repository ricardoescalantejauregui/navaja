// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { generarMatrizQr, matrizASvg } from './logica.js';

describe('DEV-18 generarMatrizQr', () => {
  test('un texto corto usa la versión 1, de 21 módulos', () => {
    assert.equal(generarMatrizQr('hola', 'L').length, 21);
  });

  test('un texto más largo aumenta el tamaño', () => {
    assert.ok(generarMatrizQr('a'.repeat(200), 'M').length > 21);
  });

  test('una corrección mayor no reduce el tamaño', () => {
    const texto = 'https://navaja.dev/formateador-json/';
    assert.ok(generarMatrizQr(texto, 'H').length >= generarMatrizQr(texto, 'L').length);
  });

  test('dibuja los patrones de localización en las tres esquinas', () => {
    const matriz = generarMatrizQr('hola');
    const fin = matriz.length - 1;
    for (const [x, y] of [[0, 0], [fin, 0], [0, fin]]) assert.equal(matriz[y][x], true);
    assert.equal(matriz[fin][fin - 7] !== undefined, true);
  });

  test('rechaza un texto que excede la capacidad', () => {
    assert.throws(() => generarMatrizQr('a'.repeat(3000), 'H'), { codigo: 'QR_DEMASIADO_LARGO' });
  });
});

describe('DEV-18 matrizASvg', () => {
  test('genera un SVG con margen y fondo blanco', () => {
    const svg = matrizASvg([[true, false], [false, true]], 1);
    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.includes('viewBox="0 0 4 4"'));
    assert.ok(svg.includes('M1 1h1v1h-1z'));
    assert.ok(svg.includes('M2 2h1v1h-1z'));
  });
});
