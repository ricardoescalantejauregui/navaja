// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

// Por debajo de este valor se entiende que el timestamp está en segundos (hasta el año 5138).
const LIMITE_SEGUNDOS = 1e11;

export function convertirFecha(texto) {
  const limpio = texto.trim();
  const numero = Number(limpio);
  let fecha;

  if (limpio !== '' && Number.isFinite(numero)) {
    fecha = new Date(Math.abs(numero) < LIMITE_SEGUNDOS ? numero * 1000 : numero);
  } else {
    fecha = new Date(limpio);
  }

  if (Number.isNaN(fecha.getTime())) throw new ErrorHerramienta('FECHA_INVALIDA');

  return {
    fecha,
    iso: fecha.toISOString(),
    utc: fecha.toUTCString(),
    segundos: Math.floor(fecha.getTime() / 1000),
    milisegundos: fecha.getTime(),
  };
}
