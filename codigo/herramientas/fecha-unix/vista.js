// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { t } from '../../nucleo/i18n.js';
import { convertirFecha } from './logica.js';

const PREFIJO = 'herramientas.fecha-unix';
const formatoLocal = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'long' });

export function crearVista() {
  return crearMarco({
    id: 'fecha-unix',
    entrada: { crearEjemplo: () => String(Math.floor(Date.now() / 1000)) },
    procesar: ({ texto }) => {
      const { fecha, iso, utc, segundos, milisegundos } = convertirFecha(texto);
      return [
        `${t(`${PREFIJO}.etiquetaLocal`)}: ${formatoLocal.format(fecha)}`,
        `${t(`${PREFIJO}.etiquetaUtc`)}: ${utc}`,
        `${t(`${PREFIJO}.etiquetaIso`)}: ${iso}`,
        `${t(`${PREFIJO}.etiquetaSegundos`)}: ${segundos}`,
        `${t(`${PREFIJO}.etiquetaMilisegundos`)}: ${milisegundos}`,
      ].join('\n');
    },
  });
}
