// SPDX-License-Identifier: AGPL-3.0-only
// Ctrl+K o Cmd+K lleva al buscador desde cualquier pantalla.
export function registrarAtajos({ alBuscar }) {
  document.addEventListener('keydown', (evento) => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
      evento.preventDefault();
      alBuscar();
    }
  });
}
