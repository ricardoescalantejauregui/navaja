// SPDX-License-Identifier: AGPL-3.0-only
// Servidor local sin dependencias. Aplica la misma CSP que producción.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const carpeta = resolve(process.argv[2] ?? 'codigo');
const puerto = Number(process.env.PORT ?? 5173);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

const CABECERAS = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; worker-src 'self' blob:",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
};

async function responderArchivo(ruta, respuesta, estado = 200) {
  const contenido = await readFile(ruta);
  const tipo = TIPOS[extname(ruta)] ?? 'application/octet-stream';
  respuesta.writeHead(estado, { ...CABECERAS, 'Content-Type': tipo });
  respuesta.end(contenido);
}

createServer(async (peticion, respuesta) => {
  const ruta = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
  const destino = normalize(join(carpeta, ruta));

  if (destino !== carpeta && !destino.startsWith(carpeta + sep)) {
    respuesta.writeHead(403, CABECERAS);
    respuesta.end();
    return;
  }

  try {
    if (extname(destino)) {
      await responderArchivo(destino, respuesta);
      return;
    }
    // Una página generada por el build tiene prioridad sobre la aplicación base.
    await responderArchivo(join(destino, 'index.html'), respuesta);
  } catch {
    if (extname(destino)) {
      respuesta.writeHead(404, CABECERAS);
      respuesta.end();
      return;
    }
    await responderArchivo(join(carpeta, 'index.html'), respuesta);
  }
}).listen(puerto, () => {
  console.log(`Navaja disponible en http://localhost:${puerto} (${carpeta})`);
});
