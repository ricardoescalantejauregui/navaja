// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { comprimirGzip, descomprimirGzip } from './logica.js';

describe('DEV-17 comprimirGzip', () => {
  test('informa el tamaño antes y después', async () => {
    const texto = 'navaja '.repeat(100);
    const { antes, despues } = await comprimirGzip(texto);
    assert.equal(antes, 700);
    assert.ok(despues < antes);
  });
});

describe('DEV-17 descomprimirGzip', () => {
  test('recupera el texto original con acentos', async () => {
    const { base64 } = await comprimirGzip('ñandú 👋');
    assert.equal(await descomprimirGzip(base64), 'ñandú 👋');
  });

  test('rechaza datos que no son GZip', async () => {
    await assert.rejects(() => descomprimirGzip('aG9sYQ=='), { codigo: 'GZIP_INVALIDO' });
  });

  test('rechaza texto que no es Base64', async () => {
    await assert.rejects(() => descomprimirGzip('$$$'), { codigo: 'GZIP_INVALIDO' });
  });
});
