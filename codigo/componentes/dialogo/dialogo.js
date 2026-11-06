// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';

// El <dialog> nativo atrapa el foco y cierra con Esc. El foco se devuelve de forma explícita
// porque Safari no enfoca los botones al hacer clic y no sabría a dónde regresar.
export function pedirConfirmacion({ titulo, texto, confirmar, cancelar, origen }) {
  return new Promise((resolver) => {
    const idTitulo = 'dialogo-titulo';
    const dialogo = el(
      'dialog',
      { clase: 'dialogo', 'aria-labelledby': idTitulo },
      el('h2', { clase: 'dialogo__titulo', id: idTitulo }, titulo),
      el('p', { clase: 'dialogo__texto' }, texto),
      el(
        'div',
        { clase: 'dialogo__acciones' },
        el('button', { clase: 'boton', type: 'button', eventos: { click: () => dialogo.close('cancelar') } }, cancelar),
        el(
          'button',
          { clase: 'boton boton--peligro', type: 'button', eventos: { click: () => dialogo.close('confirmar') } },
          confirmar,
        ),
      ),
    );
    dialogo.addEventListener('close', () => {
      dialogo.remove();
      origen?.focus();
      resolver(dialogo.returnValue === 'confirmar');
    });
    document.body.append(dialogo);
    dialogo.showModal();
  });
}
