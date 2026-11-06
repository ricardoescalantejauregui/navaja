// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { generarMatrizQr, matrizASvg } from './logica.js';

const PREFIJO = 'herramientas.generador-qr';
const ESCALA = 10;
const MARGEN = 4;

function dibujarLienzo(matriz) {
  const lado = (matriz.length + MARGEN * 2) * ESCALA;
  const lienzo = el('canvas', {
    clase: 'marco-herramienta__imagen',
    width: lado,
    height: lado,
    role: 'img',
    'aria-label': t(`${PREFIJO}.descripcionImagen`),
  });
  const contexto = lienzo.getContext('2d');
  contexto.fillStyle = '#fff';
  contexto.fillRect(0, 0, lado, lado);
  contexto.fillStyle = '#000';
  matriz.forEach((fila, y) => {
    fila.forEach((oscuro, x) => {
      if (oscuro) contexto.fillRect((x + MARGEN) * ESCALA, (y + MARGEN) * ESCALA, ESCALA, ESCALA);
    });
  });
  return lienzo;
}

function crearSalida() {
  let matrizActual = null;
  let lienzoActual = null;
  const contenedor = el('div', { clase: 'marco-herramienta__lienzo marco-herramienta__centro' });
  const vacio = () => el('p', { clase: 'marco-herramienta__vacio' }, t('marco.resultadoVacio'));
  contenedor.append(vacio());

  return {
    elemento: contenedor,
    mostrar: (matriz) => {
      matrizActual = matriz;
      lienzoActual = dibujarLienzo(matriz);
      contenedor.replaceChildren(lienzoActual);
    },
    limpiar: () => {
      matrizActual = null;
      lienzoActual = null;
      contenedor.replaceChildren(vacio());
    },
    descargas: [
      {
        etiqueta: t(`${PREFIJO}.descargarPng`),
        obtener: () =>
          new Promise((resolver) => {
            lienzoActual.toBlob((blob) => resolver({ blob, nombre: 'codigo-qr.png' }), 'image/png');
          }),
      },
      {
        etiqueta: t(`${PREFIJO}.descargarSvg`),
        obtener: () => ({
          blob: new Blob([matrizASvg(matrizActual, MARGEN)], { type: 'image/svg+xml' }),
          nombre: 'codigo-qr.svg',
        }),
      },
    ],
  };
}

export function crearVista() {
  return crearMarco({
    id: 'generador-qr',
    opciones: [{ nombre: 'correccion', valores: ['L', 'M', 'Q', 'H'], inicial: 'M' }],
    salida: crearSalida(),
    procesar: ({ texto, opciones }) => generarMatrizQr(texto, opciones.correccion),
  });
}
