// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { analizarEnLinea, analizarMarkdown, bloquesAHtml } from './logica.js';

const aHtml = (texto) => bloquesAHtml(analizarMarkdown(texto));

describe('DEV-34 analizarMarkdown', () => {
  test('reconoce títulos, listas, citas y bloques de código', () => {
    const tipos = analizarMarkdown('# T\n\n- a\n- b\n\n> c\n\n```\nd\n```\n\ne').map((bloque) => bloque.tipo);
    assert.deepEqual(tipos, ['titulo', 'lista', 'cita', 'bloqueCodigo', 'parrafo']);
  });

  test('un párrafo se corta antes de un título', () => {
    assert.deepEqual(analizarMarkdown('a\n# b').map((bloque) => bloque.tipo), ['parrafo', 'titulo']);
  });

  test('reconoce listas ordenadas', () => {
    assert.equal(analizarMarkdown('1. a\n2. b')[0].ordenada, true);
  });
});

describe('DEV-34 analizarEnLinea', () => {
  test('anida cursiva dentro de negrita', () => {
    assert.deepEqual(analizarEnLinea('**a *b***')[0].tipo, 'negrita');
  });

  test('no interpreta marcas dentro de código', () => {
    assert.deepEqual(analizarEnLinea('`**a**`'), [{ tipo: 'codigo', valor: '**a**' }]);
  });
});

describe('DEV-34 bloquesAHtml', () => {
  test('genera HTML de los elementos admitidos', () => {
    assert.equal(aHtml('**a** [b](https://c.mx)'), '<p><strong>a</strong> <a href="https://c.mx">b</a></p>');
  });

  test('el HTML del usuario se escapa y nunca genera scripts', () => {
    const html = aHtml('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    assert.ok(!html.includes('<script'));
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  test('un enlace javascript: se convierte en texto', () => {
    assert.equal(aHtml('[clic](javascript:alert(1))'), '<p>clic)</p>');
  });

  test('las comillas de una URL no rompen el atributo', () => {
    assert.ok(!aHtml('[a](https://b.mx/"onclick=x)').includes('"onclick'));
  });
});
