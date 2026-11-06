// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { desescapar, escapar } from './logica.js';

const MUESTRA = 'Café <a href="x">\'&\'</a>\n\t\\ fin';

describe('DEV-31 escapar', () => {
  test('en HTML convierte los signos reservados', () => {
    assert.equal(escapar('<a>&"\'', 'html'), '&lt;a&gt;&amp;&quot;&#39;');
  });

  test('en JSON escapa comillas y saltos de línea', () => {
    assert.equal(escapar('a"\n', 'json'), 'a\\"\\n');
  });

  test('en JavaScript escapa las comillas simples', () => {
    assert.equal(escapar("it's", 'javascript'), "it\\'s");
  });
});

describe('DEV-31 desescapar', () => {
  for (const formato of ['html', 'json', 'javascript', 'url']) {
    test(`la ida y vuelta en ${formato} devuelve el texto original`, () => {
      assert.equal(desescapar(escapar(MUESTRA, formato), formato), MUESTRA);
    });
  }

  test('en HTML no desescapa dos veces', () => {
    assert.equal(desescapar('&amp;lt;', 'html'), '&lt;');
  });

  test('un JSON con comillas sin escapar es un error', () => {
    assert.throws(() => desescapar('a"b', 'json'), { codigo: 'ESCAPE_INVALIDO' });
  });

  test('una URL con % incompleto es un error', () => {
    assert.throws(() => desescapar('%E0%A4', 'url'), { codigo: 'ESCAPE_INVALIDO' });
  });
});
