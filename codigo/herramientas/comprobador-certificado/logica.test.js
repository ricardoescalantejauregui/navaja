// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { comprobarCertificado } from './logica.js';

const textos = JSON.parse(await readFile(new URL('../../i18n/es.json', import.meta.url)));
const pem = (base64) => `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----`;

describe('comprobarCertificado', () => {
  test('acepta el ejemplo de la herramienta', () => {
    assert.deepEqual(comprobarCertificado(textos.herramientas['comprobador-certificado'].ejemplo), { tamano: 11 });
  });

  test('admite longitudes en forma larga', () => {
    const der = new Uint8Array([0x30, 0x81, 0x80, ...new Uint8Array(128)]);
    const base64 = btoa(String.fromCharCode(...der));
    assert.deepEqual(comprobarCertificado(pem(base64)), { tamano: 131 });
  });

  test('rechaza un texto sin envoltura PEM', () => {
    assert.throws(() => comprobarCertificado('hola'), { codigo: 'CERTIFICADO_INVALIDO' });
  });

  test('rechaza contenido que no es una secuencia DER', () => {
    assert.throws(() => comprobarCertificado(pem('aG9sYQ==')), { codigo: 'CERTIFICADO_INVALIDO' });
  });

  test('rechaza una longitud que no coincide', () => {
    assert.throws(() => comprobarCertificado(pem('MAoCAQECAQICAQM=')), { codigo: 'CERTIFICADO_INVALIDO' });
  });
});
