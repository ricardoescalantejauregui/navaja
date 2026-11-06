// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { convertirFecha } from './logica.js';

describe('DEV-08 convertirFecha', () => {
  test('interpreta un timestamp en segundos', () => {
    assert.equal(convertirFecha('1700000000').iso, '2023-11-14T22:13:20.000Z');
  });

  test('interpreta un timestamp en milisegundos', () => {
    assert.equal(convertirFecha('1700000000000').segundos, 1700000000);
  });

  test('interpreta una fecha ISO', () => {
    assert.equal(convertirFecha('2026-11-06T12:00:00Z').milisegundos, Date.UTC(2026, 10, 6, 12));
  });

  test('ignora espacios alrededor', () => {
    assert.equal(convertirFecha('  0 ').iso, '1970-01-01T00:00:00.000Z');
  });

  test('rechaza un texto que no es fecha', () => {
    assert.throws(() => convertirFecha('ayer no'), { codigo: 'FECHA_INVALIDA' });
  });

  test('rechaza un valor fuera de rango', () => {
    assert.throws(() => convertirFecha('9'.repeat(30)), { codigo: 'FECHA_INVALIDA' });
  });
});
