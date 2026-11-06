// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';

export function crearPie({ alBorrar }) {
  return el(
    'footer',
    { clase: 'pie' },
    el('p', {}, t('pie.promesa')),
    el(
      'nav',
      { clase: 'pie__enlaces', 'aria-label': t('pie.navegacion') },
      el('a', { clase: 'pie__enlace', href: '/acerca-de/' }, t('pie.acerca')),
      el('a', { clase: 'pie__enlace', href: '/privacidad/' }, t('pie.privacidad')),
      el('a', { clase: 'pie__enlace', href: t('aplicacion.repositorio'), rel: 'noopener' }, t('pie.codigo')),
      el(
        'button',
        { clase: 'pie__enlace', type: 'button', eventos: { click: (evento) => alBorrar(evento.currentTarget) } },
        t('pie.borrar'),
      ),
    ),
  );
}
