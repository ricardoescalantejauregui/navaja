// SPDX-License-Identifier: AGPL-3.0-only
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { analizarCron, proximasEjecuciones } from './logica.js';

// Viernes 6 de noviembre de 2026, 10:30, en hora local.
const DESDE = new Date(2026, 10, 6, 10, 30);
const proximas = (expresion, cantidad) => proximasEjecuciones(analizarCron(expresion), DESDE, cantidad);

describe('DEV-09 analizarCron', () => {
  test('exige 5 campos', () => {
    assert.throws(() => analizarCron('* * *'), { codigo: 'CRON_CAMPOS' });
  });

  test('indica el campo no válido', () => {
    assert.throws(() => analizarCron('60 * * * *'), { codigo: 'CRON_CAMPO', datos: { campo: 'minuto' } });
    assert.throws(() => analizarCron('* * 32 * *'), { codigo: 'CRON_CAMPO', datos: { campo: 'diaMes' } });
    assert.throws(() => analizarCron('* * * * x'), { codigo: 'CRON_CAMPO', datos: { campo: 'diaSemana' } });
  });

  test('expande listas, rangos y pasos', () => {
    assert.deepEqual(analizarCron('1,5-7 */6 * * *').minuto.valores, [1, 5, 6, 7]);
    assert.deepEqual(analizarCron('* */6 * * *').hora.valores, [0, 6, 12, 18]);
  });

  test('trata el 7 como domingo', () => {
    assert.deepEqual(analizarCron('* * * * 7').diaSemana.valores, [0]);
  });
});

describe('DEV-09 proximasEjecuciones', () => {
  test('de lunes a viernes a las 9 salta el fin de semana', () => {
    const [primera, segunda] = proximas('0 9 * * 1-5', 2);
    assert.deepEqual(primera, new Date(2026, 10, 9, 9, 0));
    assert.deepEqual(segunda, new Date(2026, 10, 10, 9, 0));
  });

  test('devuelve 5 ejecuciones por defecto', () => {
    assert.equal(proximasEjecuciones(analizarCron('* * * * *'), DESDE).length, 5);
  });

  test('con día del mes y de la semana basta con que coincida uno', () => {
    const [primera] = proximas('0 0 15 * 1');
    assert.deepEqual(primera, new Date(2026, 10, 9, 0, 0));
  });

  test('avisa si una fecha imposible nunca se ejecuta', () => {
    assert.throws(() => proximas('0 0 31 2 *'), { codigo: 'CRON_SIN_FECHAS' });
  });
});
