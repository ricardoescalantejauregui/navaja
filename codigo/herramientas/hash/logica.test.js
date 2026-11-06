// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularHash } from './logica.js';

describe('DEV-20 calcularHash', () => {
  test('SHA-256 de abc coincide con el vector de prueba', async () => {
    assert.equal(
      await calcularHash('abc', 'SHA-256'),
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  test('SHA-1 de abc coincide con el vector de prueba', async () => {
    assert.equal(await calcularHash('abc', 'SHA-1'), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  test('SHA-512 produce 128 caracteres', async () => {
    assert.equal((await calcularHash('abc', 'SHA-512')).length, 128);
  });

  test('un texto y sus bytes dan el mismo resultado', async () => {
    assert.equal(await calcularHash('ñ'), await calcularHash(new TextEncoder().encode('ñ')));
  });
});
