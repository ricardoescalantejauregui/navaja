// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

const CAMPOS = [
  { nombre: 'minuto', minimo: 0, maximo: 59 },
  { nombre: 'hora', minimo: 0, maximo: 23 },
  { nombre: 'diaMes', minimo: 1, maximo: 31 },
  { nombre: 'mes', minimo: 1, maximo: 12 },
  { nombre: 'diaSemana', minimo: 0, maximo: 7 },
];
const DIAS_A_REVISAR = 366 * 4 + 1;

function analizarParte(parte, { minimo, maximo }) {
  const [base, textoPaso] = parte.split('/');
  const paso = textoPaso === undefined ? 1 : Number(textoPaso);
  if (!Number.isInteger(paso) || paso < 1) return null;

  let inicio = minimo;
  let fin = maximo;
  if (base !== '*') {
    const [textoInicio, textoFin] = base.split('-');
    inicio = Number(textoInicio);
    fin = textoFin === undefined ? (textoPaso === undefined ? inicio : maximo) : Number(textoFin);
  }
  if (!Number.isInteger(inicio) || !Number.isInteger(fin) || inicio < minimo || fin > maximo || inicio > fin) return null;

  const valores = [];
  for (let valor = inicio; valor <= fin; valor += paso) valores.push(valor);
  return valores;
}

function analizarCampo(texto, campo) {
  const valores = new Set();
  for (const parte of texto.split(',')) {
    const resultado = parte === '' ? null : analizarParte(parte, campo);
    if (!resultado) throw new ErrorHerramienta('CRON_CAMPO', { campo: campo.nombre });
    resultado.forEach((valor) => valores.add(campo.nombre === 'diaSemana' ? valor % 7 : valor));
  }
  return { texto, valores: [...valores].sort((a, b) => a - b), restringido: !texto.startsWith('*') };
}

export function analizarCron(expresion) {
  const partes = expresion.trim().split(/\s+/);
  if (partes.length !== CAMPOS.length) throw new ErrorHerramienta('CRON_CAMPOS');
  return Object.fromEntries(CAMPOS.map((campo, indice) => [campo.nombre, analizarCampo(partes[indice], campo)]));
}

// Si día del mes y día de la semana están restringidos, basta con que coincida uno, como en crontab.
function coincideDia(cron, fecha) {
  if (!cron.mes.valores.includes(fecha.getMonth() + 1)) return false;
  const porMes = cron.diaMes.valores.includes(fecha.getDate());
  const porSemana = cron.diaSemana.valores.includes(fecha.getDay());
  return cron.diaMes.restringido && cron.diaSemana.restringido ? porMes || porSemana : porMes && porSemana;
}

export function proximasEjecuciones(cron, desde = new Date(), cantidad = 5) {
  const resultado = [];
  const dia = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());

  for (let revisados = 0; revisados < DIAS_A_REVISAR; revisados += 1) {
    if (coincideDia(cron, dia)) {
      for (const hora of cron.hora.valores) {
        for (const minuto of cron.minuto.valores) {
          const ejecucion = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora, minuto);
          if (ejecucion > desde) resultado.push(ejecucion);
          if (resultado.length === cantidad) return resultado;
        }
      }
    }
    dia.setDate(dia.getDate() + 1);
  }

  if (resultado.length === 0) throw new ErrorHerramienta('CRON_SIN_FECHAS');
  return resultado;
}
