// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { crearIcono } from '../../nucleo/iconos.js';

const DURACION = 4000;
let contenedor;

export function iniciarAvisos(destino) {
  contenedor = el('div', { clase: 'aviso', role: 'status', 'aria-live': 'polite' });
  destino.replaceWith(contenedor);
}

export function mostrarAviso(texto, { error = false } = {}) {
  const cerrar = () => mensaje.remove();
  const mensaje = el(
    'div',
    { clase: `aviso__mensaje${error ? ' aviso__mensaje--error' : ''}` },
    el('span', {}, texto),
    el(
      'button',
      {
        clase: 'boton boton--solo-icono boton--sobre-resultado',
        type: 'button',
        'aria-label': t('aviso.cerrar'),
        eventos: { click: cerrar },
      },
      crearIcono('limpiar'),
    ),
  );
  contenedor.append(mensaje);
  setTimeout(cerrar, DURACION);
}
