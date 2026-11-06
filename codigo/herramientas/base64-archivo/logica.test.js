// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analizarDataUri, bytesADataUri, extensionDe } from './logica.js';

describe('DEV-13 bytesADataUri', () => {
  test('construye un Data URI con su tipo', () => {
    assert.equal(bytesADataUri(new Uint8Array([104, 111, 108, 97]), 'text/plain'), 'data:text/plain;base64,aG9sYQ==');
  });

  test('usa un tipo genérico si no se conoce', () => {
    assert.ok(bytesADataUri(new Uint8Array([1]), '').startsWith('data:application/octet-stream;base64,'));
  });
});

describe('DEV-13 analizarDataUri', () => {
  test('hace la ida y vuelta sin perder bytes', () => {
    const original = new Uint8Array([0, 127, 128, 255]);
    const { tipo, bytes } = analizarDataUri(bytesADataUri(original, 'image/png'));
    assert.equal(tipo, 'image/png');
    assert.deepEqual([...bytes], [...original]);
  });

  test('rechaza un texto que no es Data URI', () => {
    assert.throws(() => analizarDataUri('hola'), { codigo: 'DATA_URI_INVALIDO' });
  });

  test('el ejemplo de la herramienta es válido', async () => {
    const textos = JSON.parse(await readFile(new URL('../../i18n/es.json', import.meta.url)));
    assert.equal(analizarDataUri(textos.herramientas['base64-archivo'].ejemplo).tipo, 'image/svg+xml');
  });
});

describe('DEV-13 extensionDe', () => {
  test('conoce los tipos comunes y usa bin para el resto', () => {
    assert.equal(extensionDe('image/png'), 'png');
    assert.equal(extensionDe('x/y'), 'bin');
  });
});
