// SPDX-License-Identifier: AGPL-3.0-only
// Navegación con URL propias. Los enlaces internos son <a> reales para no romper abrir en otra pestaña.
export function crearEnrutador(alCambiar) {
  function navegar(ruta) {
    history.pushState(null, '', ruta);
    alCambiar(ruta, { desdeHistorial: false });
  }

  document.addEventListener('click', (evento) => {
    const enlace = evento.target.closest('a[href]');
    if (!enlace || evento.defaultPrevented) return;
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    if (enlace.target || enlace.hasAttribute('download')) return;

    const destino = new URL(enlace.href, location.href);
    if (destino.origin !== location.origin) return;

    evento.preventDefault();
    if (destino.pathname + destino.hash === '/' + '#contenido') return;
    if (destino.hash && destino.pathname === location.pathname) {
      const seccion = document.querySelector(destino.hash);
      seccion?.focus({ preventScroll: true });
      seccion?.scrollIntoView();
      return;
    }
    navegar(destino.pathname);
  });

  window.addEventListener('popstate', () => alCambiar(location.pathname, { desdeHistorial: true }));

  return { navegar, iniciar: () => alCambiar(location.pathname, { desdeHistorial: true, inicial: true }) };
}
