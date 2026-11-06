// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco, crearSalidaTexto } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { formatearTamano } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { comprimirGzip, descomprimirGzip } from './logica.js';

export function crearVista() {
  return crearMarco({
    id: 'gzip',
    entrada: { archivoComoTexto: true },
    opciones: [{ nombre: 'accion', valores: ['comprimir', 'descomprimir'] }],
    salida: crearSalidaTexto({ archivo: { nombre: 'resultado.txt', tipo: 'text/plain' } }),
    procesar: async ({ texto, opciones }) => {
      if (opciones.accion === 'descomprimir') return descomprimirGzip(texto);
      const { base64, antes, despues } = await comprimirGzip(texto);
      return {
        texto: base64,
        nota: t('herramientas.gzip.tamanos', { antes: formatearTamano(antes), despues: formatearTamano(despues) }),
      };
    },
  });
}
