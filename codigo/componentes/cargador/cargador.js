// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';

const ESPERA_ANTES_DE_MOSTRAR = 300;
let cargador;
let temporizador;
let activos = 0;

export function iniciarCargador(destino) {
  cargador = el(
    'div',
    { clase: 'cargador', role: 'status', hidden: true },
    el('span', { clase: 'visualmente-oculto' }, t('marco.procesando')),
    el('span', { clase: 'cargador__hoja' }),
  );
  destino.replaceWith(cargador);
}

// Solo aparece si la tarea tarda más de 300 ms, para que las rápidas no parpadeen.
export function mostrarCargador() {
  activos += 1;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    cargador.hidden = false;
  }, ESPERA_ANTES_DE_MOSTRAR);
}

export function ocultarCargador() {
  activos = Math.max(0, activos - 1);
  if (activos > 0) return;
  clearTimeout(temporizador);
  cargador.hidden = true;
}
