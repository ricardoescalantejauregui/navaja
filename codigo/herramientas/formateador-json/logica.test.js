// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { formatearJson, minificarJson } from './logica.js';

describe('DEV-01 formatearJson', () => {
  test('con 2 espacios produce 7 líneas y la segunda lleva sangría', () => {
    const lineas = formatearJson('{"a":1,"b":[1,2]}', '2').split('\n');
    assert.equal(lineas.length, 7);
    assert.equal(lineas[1], '  "a": 1,');
  });

  test('admite tabuladores', () => {
    assert.equal(formatearJson('{"a":1}', 'tab'), '{\n\t"a": 1\n}');
  });

  test('un JSON inválido indica línea y columna', () => {
    assert.throws(() => formatearJson('{"a":1,}'), { codigo: 'JSON_INVALIDO', datos: { linea: 1, columna: 8 } });
  });

  test('ubica errores en líneas posteriores', () => {
    assert.throws(() => formatearJson('{\n  "a": x\n}'), { codigo: 'JSON_INVALIDO', datos: { linea: 2, columna: 8 } });
  });
});

describe('DEV-01 ubicación de errores', () => {
  const casos = [
    ['', 1, 1],
    ['{"a":1', 1, 7],
    ['[1,2,]', 1, 6],
    ['{"a" 1}', 1, 6],
    ['{a:1}', 1, 2],
    ['"sin cerrar', 1, 1],
    ['{"a":1} extra', 1, 9],
    ['[\n1,\n\n01]', 4, 2],
  ];

  for (const [texto, linea, columna] of casos) {
    test(`${JSON.stringify(texto)} falla en ${linea}:${columna}`, () => {
      assert.throws(() => formatearJson(texto), { codigo: 'JSON_INVALIDO', datos: { linea, columna } });
    });
  }
});

describe('DEV-01 minificarJson', () => {
  test('quita espacios fuera de las cadenas', () => {
    assert.equal(minificarJson('{ "a b" : [ 1 , 2 ] }'), '{"a b":[1,2]}');
  });
});
