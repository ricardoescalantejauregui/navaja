// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { agruparPorCategoria, filtrarHerramientas, normalizar } from './registro.js';

const raiz = new URL('../', import.meta.url);
const manifiesto = JSON.parse(await readFile(new URL('herramientas.manifiesto.json', raiz)));
const textos = JSON.parse(await readFile(new URL('i18n/es.json', raiz)));
const traducir = (clave) => clave.split('.').reduce((nodo, parte) => nodo[parte], textos);
const { herramientas, categorias } = manifiesto;
const ids = (lista) => lista.map((herramienta) => herramienta.id);

describe('RF-02 normalizar', () => {
  test('ignora mayúsculas y acentos', () => {
    assert.equal(normalizar('  CONVERSIÓN '), 'conversion');
  });
});

describe('RF-02 y RF-03 filtrarHerramientas', () => {
  test('encuentra por nombre sin acentos', () => {
    assert.deepEqual(ids(filtrarHerramientas(herramientas, { consulta: 'compresion' }, traducir)), ['gzip']);
  });

  test('encuentra por palabra clave', () => {
    assert.ok(ids(filtrarHerramientas(herramientas, { consulta: 'sha-256' }, traducir)).includes('hash'));
  });

  test('exige todas las palabras de la consulta', () => {
    assert.deepEqual(ids(filtrarHerramientas(herramientas, { consulta: 'base64 imagen' }, traducir)), ['base64-archivo']);
  });

  test('sin coincidencias devuelve una lista vacía', () => {
    assert.deepEqual(filtrarHerramientas(herramientas, { consulta: 'zzzz' }, traducir), []);
  });

  test('filtra por perfil', () => {
    const resultado = filtrarHerramientas(herramientas, { perfil: 'grafico' }, traducir);
    assert.ok(resultado.every((herramienta) => herramienta.perfil.includes('grafico')));
    assert.ok(resultado.length > 0);
  });
});

describe('RF-01 agruparPorCategoria', () => {
  test('respeta el orden de las categorías y omite las vacías', () => {
    const grupos = agruparPorCategoria([herramientas.at(-1), herramientas[0]], categorias);
    assert.deepEqual(grupos.map((grupo) => grupo.categoria), ['formato', 'color']);
  });
});

describe('RNF-09 y RNF-10 coherencia del catálogo', () => {
  for (const herramienta of herramientas) {
    test(`${herramienta.id} tiene textos, categoría y vista`, async () => {
      const texto = textos.herramientas[herramienta.id];
      assert.ok(texto?.nombre, 'falta el nombre');
      assert.ok(texto.descripcion, 'falta la descripción');
      assert.ok(texto.uso?.length >= 2, 'faltan frases de uso');
      assert.ok(categorias.includes(herramienta.categoria), 'categoría desconocida');
      await readFile(new URL(`herramientas/${herramienta.id}/vista.js`, raiz));
      await readFile(new URL(`herramientas/${herramienta.id}/logica.js`, raiz));
    });
  }
});
