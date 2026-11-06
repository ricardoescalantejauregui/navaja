// SPDX-License-Identifier: AGPL-3.0-only
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const manifiesto = JSON.parse(await readFile(new URL('../../codigo/herramientas.manifiesto.json', import.meta.url)));
const textos = JSON.parse(await readFile(new URL('../../codigo/i18n/es.json', import.meta.url)));
const ids = manifiesto.herramientas.map((herramienta) => herramienta.id);
// base64-archivo pide un archivo en su modo inicial y tiene su propia prueba.
const herramientasDeTexto = ids.filter(
  (id) => id !== 'base64-archivo' && (textos.herramientas[id].ejemplo !== undefined || id === 'fecha-unix'),
);

async function revisarAccesibilidad(page) {
  const { violations: violaciones } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violaciones.map(({ id, nodes }) => `${id}: ${nodes[0].target}`)).toEqual([]);
}

// Falla si hay errores de consola, violaciones de CSP o peticiones a otros dominios.
function vigilar(page) {
  const problemas = [];
  page.on('console', (mensaje) => {
    if (mensaje.type() === 'error') problemas.push(mensaje.text());
  });
  page.on('pageerror', (error) => problemas.push(error.message));
  page.on('request', (peticion) => {
    const url = new URL(peticion.url());
    if (['http:', 'https:'].includes(url.protocol) && url.hostname !== 'localhost') problemas.push(`externa: ${url}`);
  });
  return problemas;
}

test.describe('RF-02 Búsqueda de herramientas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox').waitFor();
  });

  test('Buscar por nombre sin acentos', async ({ page }) => {
    await page.getByRole('searchbox').fill('compresion');
    await expect(page.getByRole('link', { name: /Compresión GZip/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Formateador JSON/ })).toHaveCount(0);
  });

  test('Buscar por palabra clave', async ({ page }) => {
    await page.getByRole('searchbox').fill('sha-256');
    await expect(page.getByRole('link', { name: /Hash y checksum/ })).toBeVisible();
  });

  test('Sin resultados', async ({ page }) => {
    await page.getByRole('searchbox').fill('zzzz');
    await expect(page.getByText('No encontramos herramientas para «zzzz»')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
    await expect(page.getByRole('link', { name: /Formateador JSON/ })).toBeVisible();
  });

  test('Atajo de teclado', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('searchbox')).toBeFocused();
  });
});

test.describe('RF-05 Navegación por URL', () => {
  test('Abrir una herramienta desde el listado', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Formateador JSON/ }).click();
    await expect(page).toHaveURL('/formateador-json/');
    await expect(page.getByRole('heading', { level: 1, name: 'Formateador JSON' })).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
  });

  test('Volver con el botón Atrás del navegador', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Formateador JSON/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Formateador JSON' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByRole('link', { name: /Formateador JSON/ })).toBeFocused();
  });

  test('Abrir directamente una URL', async ({ page }) => {
    await page.goto('/generador-qr/');
    await expect(page.getByRole('heading', { level: 1, name: 'Generador QR' })).toBeVisible();
  });

  test('URL inexistente', async ({ page }) => {
    await page.goto('/no-existe/');
    await expect(page.getByRole('heading', { level: 1, name: 'Página no encontrada' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Buscar una herramienta' })).toBeVisible();
  });
});

test.describe('RF-07 y RF-08 Favoritos y recientes', () => {
  test('Marcar una favorita y conservarla al recargar', async ({ page }) => {
    await page.goto('/hash/');
    await page.getByRole('button', { name: 'Agregar a favoritos' }).click();
    await expect(page.getByRole('button', { name: 'Quitar de favoritos' })).toBeVisible();
    await page.goto('/favoritos/');
    await expect(page.getByRole('link', { name: /Hash y checksum/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('link', { name: /Hash y checksum/ })).toBeVisible();
  });

  test('Recientes ordenadas de la más nueva a la más antigua', async ({ page }) => {
    await page.goto('/hash/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hash y checksum');
    await page.goto('/cron/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Expresiones cron');
    await page.goto('/recientes/');
    await expect(page.locator('.fila-herramienta__nombre').first()).toHaveText('Expresiones cron');
  });
});

test.describe('RF-09 Tema', () => {
  test('El tema elegido se recuerda', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Tema del sistema/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
    await page.getByRole('button', { name: /Tema claro/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'oscuro');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'oscuro');
  });
});

test.describe('RF-12 Borrar mis datos', () => {
  test('Confirmar el borrado', async ({ page }) => {
    await page.goto('/hash/');
    await page.getByRole('button', { name: 'Agregar a favoritos' }).click();
    await page.getByRole('button', { name: 'Borrar mis datos' }).click();
    await expect(page.getByRole('dialog')).toContainText('¿Borrar favoritos, recientes y preferencias?');
    await page.getByRole('button', { name: 'Borrar', exact: true }).click();
    await expect(page.getByText('Tus datos se borraron')).toBeVisible();
    await page.goto('/favoritos/');
    await expect(page.getByText('Aún no tienes favoritos')).toBeVisible();
  });

  test('Cancelar el borrado', async ({ page }) => {
    await page.goto('/hash/');
    await page.getByRole('button', { name: 'Agregar a favoritos' }).click();
    const borrar = page.getByRole('button', { name: 'Borrar mis datos' });
    await borrar.click();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(borrar).toBeFocused();
    await page.goto('/favoritos/');
    await expect(page.getByRole('link', { name: /Hash y checksum/ })).toBeVisible();
  });
});

test.describe('RF-C Comportamiento de las herramientas', () => {
  test('Formatear JSON válido', async ({ page }) => {
    await page.goto('/formateador-json/');
    await page.getByRole('textbox', { name: 'Entrada' }).fill('{"a":1,"b":[1,2]}');
    const resultado = page.getByRole('textbox', { name: 'Resultado' });
    await expect(resultado).toHaveValue(/"a": 1,/);
    await expect(resultado).toHaveValue(/\n  "b": \[\n/);
  });

  test('JSON inválido', async ({ page }) => {
    await page.goto('/formateador-json/');
    await page.getByRole('textbox', { name: 'Entrada' }).fill('{"a":1,}');
    await expect(page.getByRole('alert')).toHaveText('JSON no válido en la línea 1, columna 8');
    await expect(page.getByRole('textbox', { name: 'Entrada' })).toHaveAttribute('aria-invalid', 'true');
  });

  test('Decodificar un Data URI y ver la imagen', async ({ page }) => {
    await page.goto('/base64-archivo/');
    await page.getByRole('radio', { name: 'Data URI a archivo' }).check();
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.getByRole('img', { name: 'Vista previa de la imagen' })).toBeVisible();
    await expect(page.getByText('Tipo: image/svg+xml.', { exact: false })).toBeVisible();
  });

  test('Generar un QR y descargarlo en SVG', async ({ page }) => {
    await page.goto('/generador-qr/');
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.locator('canvas')).toBeVisible();
    const descarga = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar SVG' }).click();
    expect((await descarga).suggestedFilename()).toBe('codigo-qr.svg');
  });

  test('Simular daltonismo con una imagen', async ({ page }) => {
    await page.goto('/simulador-daltonismo/');
    const pixelPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64',
    );
    await page.locator('input[type=file]').setInputFiles({ name: 'p.png', mimeType: 'image/png', buffer: pixelPng });
    await expect(page.getByText('Simulación', { exact: true })).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(2);
  });

  test('Rechazar un archivo que no es imagen', async ({ page }) => {
    await page.goto('/simulador-daltonismo/');
    await page.locator('input[type=file]').setInputFiles({ name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') });
    await expect(page.getByRole('alert')).toHaveText('El archivo no es una imagen compatible');
  });

  for (const id of herramientasDeTexto) {
    test(`El ejemplo de ${id} produce un resultado sin errores`, async ({ page }) => {
      const problemas = vigilar(page);
      await page.goto(`/${id}/`);
      await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^Descargar|^Copiar/ }).first()).toBeEnabled();
      expect(problemas).toEqual([]);
    });
  }
});

test.describe('RNF-03 Privacidad', () => {
  test('Ninguna herramienta envía datos', async ({ page }) => {
    const problemas = vigilar(page);
    const peticiones = [];
    page.on('request', (peticion) => peticiones.push(peticion.url() + (peticion.postData() ?? '')));
    await page.goto('/jwt/');
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await page.getByRole('textbox', { name: 'Resultado' }).waitFor();
    expect(peticiones.filter((url) => url.includes('eyJ'))).toEqual([]);
    expect(problemas).toEqual([]);
  });
});

test.describe('RNF-08 SEO', () => {
  test('Cada herramienta trae título y ayuda en el HTML inicial', async ({ request }) => {
    for (const id of ids) {
      const html = await (await request.get(`/${id}/`)).text();
      const { nombre, uso } = textos.herramientas[id];
      expect(html).toContain(`<title>${nombre} | Navaja</title>`);
      expect(html).toContain('rel="canonical"');
      expect(html).toContain(uso[0].replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;'));
    }
  });
});

test.describe('RNF-02 Accesibilidad y RNF-06 Responsive', () => {
  const rutas = ['/', '/favoritos/', '/recientes/', '/acerca-de/', '/privacidad/', '/no-existe/', ...ids.map((id) => `/${id}/`)];

  for (const esquema of ['light', 'dark']) {
    for (const ruta of rutas) {
      test(`axe sin violaciones en ${ruta} con esquema ${esquema}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: esquema, reducedMotion: 'reduce' });
        await page.goto(ruta);
        await page.getByRole('heading', { level: 1 }).waitFor();
        await page.getByRole('contentinfo').waitFor();
        await revisarAccesibilidad(page);
      });
    }
  }

  for (const id of ['formateador-json', 'jwt', 'generador-qr', 'vista-previa-markdown', 'gzip']) {
    test(`axe con resultado visible en ${id}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${id}/`);
      await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
      await expect(page.getByRole('button', { name: /^Descargar|^Copiar/ }).first()).toBeEnabled();
      await revisarAccesibilidad(page);
    });
  }

  for (const ancho of [360, 768, 1280]) {
    for (const ruta of ['/', '/formateador-json/', '/generador-qr/', '/simulador-daltonismo/']) {
      test(`Sin desplazamiento horizontal en ${ruta} a ${ancho}px`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: 800 });
        await page.goto(ruta);
        await page.getByRole('contentinfo').waitFor();
        const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(desborde).toBeLessThanOrEqual(0);
      });
    }
  }

  test('Los controles interactivos miden al menos 44px en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/formateador-json/');
    await page.getByRole('contentinfo').waitFor();
    const pequenos = await page.evaluate(() =>
      [...document.querySelectorAll('button, a, .segmentado__texto, input:not([type=radio]):not([type=file]), textarea')]
        .filter((elemento) => !elemento.classList.contains('aplicacion__saltar') && elemento.offsetParent !== null)
        .map((elemento) => ({ texto: elemento.textContent.slice(0, 30), caja: elemento.getBoundingClientRect() }))
        .filter(({ caja }) => caja.height < 43.5 || caja.width < 24)
        .map(({ texto, caja }) => `${texto}: ${Math.round(caja.width)}x${Math.round(caja.height)}`),
    );
    expect(pequenos).toEqual([]);
  });

  test('Se puede abrir una herramienta solo con el teclado', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox').focus();
    await page.keyboard.type('hash');
    await page.getByRole('link', { name: /Hash y checksum/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Hash y checksum' })).toBeFocused();
  });
});
