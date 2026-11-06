// SPDX-License-Identifier: AGPL-3.0-only
// Aplica el tema guardado antes de pintar la página, para evitar un destello de color.
(function aplicarTemaInicial() {
  try {
    const tema = JSON.parse(localStorage.getItem('navaja:tema'));
    if (tema === 'claro' || tema === 'oscuro') document.documentElement.dataset.tema = tema;
  } catch {
    // Sin acceso al almacenamiento se usa el tema del sistema.
  }
})();
