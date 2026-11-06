// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { decodificarJwt } from './logica.js';

const textos = JSON.parse(await readFile(new URL('../../i18n/es.json', import.meta.url)));
const EJEMPLO = textos.herramientas.jwt.ejemplo;

describe('DEV-16 decodificarJwt', () => {
  test('lee la cabecera y la carga del ejemplo', () => {
    const { cabecera, carga } = decodificarJwt(EJEMPLO);
    assert.equal(cabecera.alg, 'HS256');
    assert.equal(carga.name, 'Navaja');
  });

  test('convierte exp en fecha y detecta un token expirado', () => {
    const { fechas, expirado } = decodificarJwt(EJEMPLO, new Date('2030-01-01'));
    assert.equal(fechas.expira.toISOString(), '2023-11-14T23:13:20.000Z');
    assert.equal(expirado, true);
  });

  test('detecta un token vigente', () => {
    assert.equal(decodificarJwt(EJEMPLO, new Date('2020-01-01')).expirado, false);
  });

  test('exige 3 partes', () => {
    assert.throws(() => decodificarJwt('a.b'), { codigo: 'JWT_SEGMENTOS' });
  });

  test('rechaza segmentos ilegibles', () => {
    assert.throws(() => decodificarJwt('a.b.c'), { codigo: 'JWT_INVALIDO' });
  });
});
