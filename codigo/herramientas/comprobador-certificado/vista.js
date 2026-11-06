// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { t } from '../../nucleo/i18n.js';
import { comprobarCertificado } from './logica.js';

const PREFIJO = 'herramientas.comprobador-certificado';

export function crearVista() {
  return crearMarco({
    id: 'comprobador-certificado',
    entrada: { archivoComoTexto: true },
    procesar: ({ texto }) => {
      const { tamano } = comprobarCertificado(texto);
      return {
        texto: `${t(`${PREFIJO}.valido`)}\n${t(`${PREFIJO}.tamano`, { tamano })}`,
        nota: t(`${PREFIJO}.local`),
      };
    },
  });
}
