// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { el } from '../../nucleo/dom.js';
import { ErrorHerramienta } from '../../nucleo/errores.js';
import { t } from '../../nucleo/i18n.js';
import { simularDaltonismo } from './logica.js';

const PREFIJO = 'herramientas.simulador-daltonismo';

async function leerImagen(archivo) {
  try {
    return await createImageBitmap(archivo);
  } catch {
    throw new ErrorHerramienta('IMAGEN_INVALIDA');
  }
}

function crearLienzo(ancho, alto, etiqueta) {
  return el('canvas', { clase: 'marco-herramienta__imagen', width: ancho, height: alto, role: 'img', 'aria-label': etiqueta });
}

function crearFigura(lienzo, etiqueta) {
  return el('figure', { clase: 'marco-herramienta__figura' }, lienzo, el('figcaption', {}, etiqueta));
}

function crearSalida() {
  let lienzoSimulado = null;
  const contenedor = el('div', { clase: 'marco-herramienta__lienzo' });
  const vacio = () => el('p', { clase: 'marco-herramienta__vacio' }, t('marco.resultadoVacio'));
  contenedor.append(vacio());

  return {
    elemento: contenedor,
    mostrar: ({ original, simulado }) => {
      lienzoSimulado = simulado;
      contenedor.replaceChildren(
        el(
          'div',
          { clase: 'marco-herramienta__comparacion' },
          crearFigura(original, t(`${PREFIJO}.etiquetaOriginal`)),
          crearFigura(simulado, t(`${PREFIJO}.etiquetaSimulacion`)),
        ),
      );
    },
    limpiar: () => {
      lienzoSimulado = null;
      contenedor.replaceChildren(vacio());
    },
    descargas: [
      {
        etiqueta: t('marco.descargar'),
        obtener: () =>
          new Promise((resolver) => {
            lienzoSimulado.toBlob((blob) => resolver({ blob, nombre: t(`${PREFIJO}.archivoSalida`) }), 'image/png');
          }),
      },
    ],
  };
}

export function crearVista() {
  return crearMarco({
    id: 'simulador-daltonismo',
    entrada: { tipo: 'archivo', aceptar: 'image/*', soloImagenes: true },
    opciones: [{ nombre: 'tipo', valores: ['protanopia', 'deuteranopia', 'tritanopia', 'acromatopsia'] }],
    salida: crearSalida(),
    procesar: async ({ archivo, opciones }) => {
      const imagen = await leerImagen(archivo);
      const original = crearLienzo(imagen.width, imagen.height, t(`${PREFIJO}.etiquetaOriginal`));
      const simulado = crearLienzo(imagen.width, imagen.height, t(`${PREFIJO}.etiquetaSimulacion`));
      const contextoOriginal = original.getContext('2d');
      contextoOriginal.drawImage(imagen, 0, 0);

      const datos = contextoOriginal.getImageData(0, 0, imagen.width, imagen.height);
      const contextoSimulado = simulado.getContext('2d');
      const pixeles = simularDaltonismo(datos.data, opciones.tipo);
      contextoSimulado.putImageData(new ImageData(pixeles, imagen.width, imagen.height), 0, 0);
      return { original, simulado };
    },
  });
}
