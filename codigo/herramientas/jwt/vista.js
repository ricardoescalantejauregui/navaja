// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { t } from '../../nucleo/i18n.js';
import { decodificarJwt } from './logica.js';

const PREFIJO = 'herramientas.jwt';
const formatoFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'medium' });

function describirFechas({ fechas, expirado }) {
  const lineas = Object.entries(fechas)
    .filter(([, fecha]) => fecha)
    .map(([clave, fecha]) => `${t(`${PREFIJO}.${clave}`)}: ${formatoFecha.format(fecha)}`);
  if (expirado !== null) lineas.push(t(`${PREFIJO}.${expirado ? 'expirado' : 'vigente'}`));
  return lineas;
}

export function crearVista() {
  return crearMarco({
    id: 'jwt',
    procesar: ({ texto }) => {
      const token = decodificarJwt(texto);
      const fechas = describirFechas(token);
      const secciones = [
        `${t(`${PREFIJO}.etiquetaCabecera`)}\n${JSON.stringify(token.cabecera, null, 2)}`,
        `${t(`${PREFIJO}.etiquetaCarga`)}\n${JSON.stringify(token.carga, null, 2)}`,
      ];
      if (fechas.length > 0) secciones.push(`${t(`${PREFIJO}.etiquetaFechas`)}\n${fechas.join('\n')}`);
      return { texto: secciones.join('\n\n'), nota: t(`${PREFIJO}.sinFirma`) };
    },
  });
}
