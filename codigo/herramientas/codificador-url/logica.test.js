// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { codificarUrl, decodificarUrl } from './logica.js';

describe('DEV-14 codificarUrl', () => {
  test('un componente codifica espacios y acentos', () => {
    assert.equal(codificarUrl('café con leche'), 'caf%C3%A9%20con%20leche');
  });

  test('un componente codifica & y =', () => {
    assert.equal(codificarUrl('a=1&b=2'), 'a%3D1%26b%3D2');
  });

  test('una URL completa conserva su estructura', () => {
    assert.equal(codificarUrl('https://a.mx/?q=é&x=1', 'completa'), 'https://a.mx/?q=%C3%A9&x=1');
  });
});

describe('DEV-14 decodificarUrl', () => {
  test('recupera el texto original', () => {
    assert.equal(decodificarUrl('caf%C3%A9%20con%20leche'), 'café con leche');
  });

  test('una URL completa no decodifica separadores', () => {
    assert.equal(decodificarUrl('a%26b%C3%A9', 'completa'), 'a%26bé');
  });

  test('rechaza secuencias incompletas', () => {
    assert.throws(() => decodificarUrl('%E0%A4%A'), { codigo: 'URL_INVALIDA' });
  });
});
