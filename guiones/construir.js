// SPDX-License-Identifier: AGPL-3.0-only
// Genera publicacion/: copia codigo/ y crea una página HTML por herramienta y por sección.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ORIGEN = 'codigo';
const DESTINO = 'publicacion';
// Dominio previsto. Cámbialo aquí si la revisión de marca lleva a otro.
const SITIO = 'https://navaja.dev';

const escaparHtml = (texto) =>
  String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function crearPagina(plantilla, { ruta, titulo, descripcion, cuerpo }) {
  const url = `${SITIO}${ruta}`;
  return plantilla
    .replace(/<title>.*<\/title>/, `<title>${escaparHtml(titulo)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escaparHtml(descripcion)}">`)
    .replace(
      '</head>',
      [
        `  <link rel="canonical" href="${url}">`,
        `  <meta property="og:title" content="${escaparHtml(titulo)}">`,
        `  <meta property="og:description" content="${escaparHtml(descripcion)}">`,
        `  <meta property="og:url" content="${url}">`,
        '  <meta property="og:type" content="website">',
        '</head>',
      ].join('\n'),
    )
    .replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/, `$1${cuerpo}$2`);
}

async function escribir(ruta, contenido) {
  const archivo = join(DESTINO, ruta);
  await mkdir(dirname(archivo), { recursive: true });
  await writeFile(archivo, contenido);
}

await rm(DESTINO, { recursive: true, force: true });
await cp(ORIGEN, DESTINO, {
  recursive: true,
  filter: (ruta) => !ruta.endsWith('.test.js') && !ruta.endsWith('.feature'),
});

const plantilla = await readFile(join(ORIGEN, 'index.html'), 'utf8');
const textos = JSON.parse(await readFile(join(ORIGEN, 'i18n/es.json'), 'utf8'));
const manifiesto = JSON.parse(await readFile(join(ORIGEN, 'herramientas.manifiesto.json'), 'utf8'));
const marca = textos.aplicacion.nombre;
const rutas = ['/'];

await escribir(
  'index.html',
  crearPagina(plantilla, {
    ruta: '/',
    titulo: `${marca}: ${textos.aplicacion.lema}`,
    descripcion: textos.portada.descripcion,
    cuerpo: `<h1>${escaparHtml(textos.portada.titulo)}</h1><p>${escaparHtml(textos.portada.descripcion)}</p>`,
  }),
);

for (const { id } of manifiesto.herramientas) {
  const herramienta = textos.herramientas[id];
  const ruta = `/${id}/`;
  const uso = herramienta.uso.map((frase) => `<p>${escaparHtml(frase)}</p>`).join('');
  rutas.push(ruta);
  await escribir(
    join(id, 'index.html'),
    crearPagina(plantilla, {
      ruta,
      titulo: `${herramienta.nombre} | ${marca}`,
      descripcion: herramienta.descripcion,
      cuerpo: `<h1>${escaparHtml(herramienta.nombre)}</h1><p>${escaparHtml(herramienta.descripcion)}</p><h2>${escaparHtml(textos.marco.comoSeUsa)}</h2>${uso}`,
    }),
  );
}

for (const clave of ['favoritos', 'recientes', 'acerca-de', 'privacidad']) {
  const pagina = textos.paginas[clave];
  const ruta = `/${clave}/`;
  if (!pagina.privada) rutas.push(ruta);
  await escribir(
    join(clave, 'index.html'),
    crearPagina(plantilla, {
      ruta,
      titulo: `${pagina.titulo} | ${marca}`,
      descripcion: pagina.descripcion,
      cuerpo: `<h1>${escaparHtml(pagina.titulo)}</h1><p>${escaparHtml(pagina.descripcion)}</p>`,
    }),
  );
}

await escribir(
  '404.html',
  crearPagina(plantilla, {
    ruta: '/404.html',
    titulo: `${textos.paginas.noEncontrada.titulo} | ${marca}`,
    descripcion: textos.paginas.noEncontrada.descripcion,
    cuerpo: `<h1>${escaparHtml(textos.paginas.noEncontrada.titulo)}</h1>`,
  }),
);

await escribir(
  'sitemap.xml',
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rutas.map((ruta) => `  <url><loc>${SITIO}${ruta}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'),
);
await escribir('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITIO}/sitemap.xml\n`);

console.log(`Publicación generada con ${rutas.length} páginas indexables en ${DESTINO}/`);
