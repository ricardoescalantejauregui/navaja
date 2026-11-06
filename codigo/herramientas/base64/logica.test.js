// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { codificarBase64, decodificarBase64 } from './logica.js';

describe('DEV-12 codificarBase64', () => {
  test('codifica acentos en UTF-8', () => {
    assert.equal(codificarBase64('ñandú'), 'w7FhbmTDug==');
  });

  test('la variante URL no usa + / ni relleno', () => {
    const resultado = codificarBase64('>>>???', 'url');
    assert.equal(resultado, 'Pj4-Pz8_');
  });
});

describe('DEV-12 decodificarBase64', () => {
  test('recupera el texto original con emojis', () => {
    assert.equal(decodificarBase64(codificarBase64('hola 👋 ñ')), 'hola 👋 ñ');
  });

  test('decodifica la variante URL sin relleno', () => {
    assert.equal(decodificarBase64('Pj4-Pz8_', 'url'), '>>>???');
  });

  test('ignora saltos de línea', () => {
    assert.equal(decodificarBase64('w7Fh\nbmTDug=='), 'ñandú');
  });

  test('rechaza caracteres no válidos', () => {
    assert.throws(() => decodificarBase64('a$b'), { codigo: 'BASE64_INVALIDO' });
  });

  test('rechaza bytes que no son UTF-8', () => {
    assert.throws(() => decodificarBase64('/w=='), { codigo: 'BASE64_INVALIDO' });
  });
});
