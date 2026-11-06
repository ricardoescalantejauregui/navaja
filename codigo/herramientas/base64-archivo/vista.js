// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { el, formatearTamano } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { analizarDataUri, bytesADataUri, extensionDe } from './logica.js';

const PREFIJO = 'herramientas.base64-archivo';

function crearSalida() {
  let actual = null;
  const lienzo = el('div', { clase: 'marco-herramienta__lienzo marco-herramienta__centro' });
  const vacio = () => el('p', { clase: 'marco-herramienta__vacio' }, t('marco.resultadoVacio'));
  lienzo.append(vacio());

  return {
    elemento: lienzo,
    mostrar: (resultado) => {
      actual = resultado;
      lienzo.replaceChildren(
        resultado.tipo.startsWith('image/') &&
          el('img', { clase: 'marco-herramienta__imagen', src: resultado.dataUri, alt: t(`${PREFIJO}.vistaPrevia`) }),
        el(
          'p',
          { clase: 'marco-herramienta__nota' },
          t(`${PREFIJO}.resumen`, { tipo: resultado.tipo, tamano: formatearTamano(resultado.bytes.length) }),
        ),
      );
    },
    limpiar: () => {
      actual = null;
      lienzo.replaceChildren(vacio());
    },
    textoACopiar: () => actual?.dataUri ?? '',
    descargas: [
      {
        etiqueta: t('marco.descargar'),
        obtener: () => ({
          blob: new Blob([actual.bytes], { type: actual.tipo }),
          nombre: `${t(`${PREFIJO}.archivoSalida`)}.${extensionDe(actual.tipo)}`,
        }),
      },
    ],
  };
}

export function crearVista() {
  return crearMarco({
    id: 'base64-archivo',
    entrada: { tipo: (valores) => (valores.accion === 'codificar' ? 'archivo' : 'texto') },
    opciones: [{ nombre: 'accion', valores: ['codificar', 'decodificar'] }],
    salida: crearSalida(),
    procesar: async ({ texto, archivo, opciones }) => {
      if (opciones.accion === 'codificar') {
        const bytes = new Uint8Array(await archivo.arrayBuffer());
        return { tipo: archivo.type, bytes, dataUri: bytesADataUri(bytes, archivo.type) };
      }
      return { ...analizarDataUri(texto), dataUri: texto.trim() };
    },
  });
}
