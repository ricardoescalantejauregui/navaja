// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { t } from '../../nucleo/i18n.js';
import { ErrorHerramienta } from '../../nucleo/errores.js';
import { analizarCron, proximasEjecuciones } from './logica.js';

const PREFIJO = 'herramientas.cron';
const formatoFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short' });
const NOMBRES_CAMPO = ['minuto', 'hora', 'diaMes', 'mes', 'diaSemana'];

function analizarConCampoLegible(texto) {
  try {
    return analizarCron(texto);
  } catch (error) {
    if (error instanceof ErrorHerramienta && error.datos.campo) {
      throw new ErrorHerramienta(error.codigo, { campo: t(`${PREFIJO}.campos.${error.datos.campo}`) });
    }
    throw error;
  }
}

export function crearVista() {
  return crearMarco({
    id: 'cron',
    procesar: ({ texto }) => {
      const cron = analizarConCampoLegible(texto);
      const campos = NOMBRES_CAMPO.map((nombre) => {
        const valor = cron[nombre].texto === '*' ? t(`${PREFIJO}.campos.cualquiera`) : cron[nombre].texto;
        return `${t(`${PREFIJO}.campos.${nombre}`)}: ${valor}`;
      });
      const fechas = proximasEjecuciones(cron).map((fecha) => formatoFecha.format(fecha));
      return [...campos, '', t(`${PREFIJO}.proximas`), ...fechas].join('\n');
    },
  });
}
