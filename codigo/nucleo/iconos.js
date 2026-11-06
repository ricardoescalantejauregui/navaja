// SPDX-License-Identifier: AGPL-3.0-only
// Iconos propios del proyecto: retícula de 24, trazo de 1.5 y un remache relleno como rasgo de familia.
const ESPACIO_SVG = 'http://www.w3.org/2000/svg';

const ICONOS = {
  sangria: { trazos: ['M4 5h9', 'M8 10h12', 'M8 15h8', 'M4 20h9', 'M4 5v15'], remache: [4, 12.5] },
  documento: { trazos: ['M6 3h9l4 4v14H6z', 'M15 3v4h4', 'M9 13h7', 'M9 17h5'], remache: [9.5, 8.5] },
  intercambio: { trazos: ['M4 8h14', 'M15 4.5 18.5 8 15 11.5', 'M20 16H6', 'M9 12.5 5.5 16 9 19.5'], remache: [12, 12] },
  imagen: { trazos: ['M4 5h16v14H4z', 'M4 16l5-5 4 4 2.5-2.5L20 17'], remache: [15.5, 9] },
  eslabon: { trazos: ['M10 14a4 4 0 0 1 0-5.6l3-3a4 4 0 0 1 5.6 5.6l-1.8 1.8', 'M14 10a4 4 0 0 1 0 5.6l-3 3a4 4 0 0 1-5.6-5.6l1.8-1.8'], remache: [12, 12] },
  diagonal: { trazos: ['M9 4l6 16', 'M4 5v4', 'M6.5 5v4', 'M17.5 15v4', 'M20 15v4'], remache: [12, 12] },
  llave: { trazos: ['M12 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z', 'M12 12h9', 'M17.5 12v3.5', 'M21 12v2.5'], remache: [7.5, 12] },
  compresion: { trazos: ['M12 3v6', 'M9 6.5 12 9.5 15 6.5', 'M12 21v-6', 'M9 17.5 12 14.5 15 17.5', 'M4 12h6', 'M14 12h6'], remache: [12, 12] },
  candado: { trazos: ['M5 11h14v10H5z', 'M8 11V7.5a4 4 0 0 1 8 0V11'], remache: [12, 16] },
  calendario: { trazos: ['M4 6h16v14H4z', 'M4 10.5h16', 'M8.5 3.5V8', 'M15.5 3.5V8'], remache: [12, 15] },
  reloj: { trazos: ['M20.5 12a8.5 8.5 0 1 1-2.5-6', 'M20.5 3.5V8H16', 'M12 7.5V12l3.5 2'], remache: [12, 12] },
  almohadilla: { trazos: ['M9.5 4 7.5 20', 'M16.5 4l-2 16', 'M4.5 9h15.5', 'M4 15h15.5'], remache: [12, 12] },
  qr: { trazos: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h2.5v2.5H14z', 'M20 20h-2.5', 'M14 20h.5'], remache: [19.5, 15] },
  circulos: { trazos: ['M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0z', 'M21 15a6 6 0 1 1-12 0 6 6 0 0 1 12 0z'], remache: [12, 12] },
  lupa: { trazos: ['M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z', 'M15.5 15.5 21 21'], remache: [10.5, 10.5] },
  estrella: { trazos: ['M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z'] },
  historial: { trazos: ['M4 12a8 8 0 1 0 2.4-5.7L4 8.5', 'M4 4v4.5h4.5', 'M12 8v4l3 2'], remache: [12, 12] },
  sol: { trazos: ['M12 3v2', 'M12 19v2', 'M3 12h2', 'M19 12h2', 'M5.6 5.6 7 7', 'M17 17l1.4 1.4', 'M5.6 18.4 7 17', 'M17 7l1.4-1.4', 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z'], remache: [12, 12] },
  luna: { trazos: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'], remache: [11, 13] },
  sistema: { trazos: ['M3.5 5h17v11h-17z', 'M9 20h6', 'M12 16v4'], remache: [12, 10.5] },
  copiar: { trazos: ['M9 9h11v11H9z', 'M5.5 15H4V4h11v1.5'] },
  descargar: { trazos: ['M12 4v11', 'M8 11.5 12 15.5 16 11.5', 'M4 20h16'] },
  pegar: { trazos: ['M9 5H5.5v15h13V5H15', 'M9 3.5h6v3.5H9z', 'M9 12h6', 'M9 16h4'] },
  limpiar: { trazos: ['M6 6l12 12', 'M18 6 6 18'] },
  archivo: { trazos: ['M3.5 6h6l2 2.5h9V19h-17z'] },
  ejemplo: { trazos: ['M5 6h14', 'M5 12h14', 'M5 18h8'] },
  volver: { trazos: ['M10 6l-6 6 6 6', 'M4 12h16'] },
  alerta: { trazos: ['M12 4 2.5 20h19z', 'M12 10v4.5'], remache: [12, 17.2] },
  listo: { trazos: ['M4.5 12.5 10 18 19.5 7'] },
};

function crearNodoSvg(etiqueta, atributos) {
  const nodo = document.createElementNS(ESPACIO_SVG, etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) nodo.setAttribute(nombre, valor);
  return nodo;
}

export function crearIcono(nombre, clase = '') {
  const icono = ICONOS[nombre];
  const svg = crearNodoSvg('svg', {
    viewBox: '0 0 24 24',
    class: `icono ${clase}`.trim(),
    'aria-hidden': 'true',
    focusable: 'false',
  });
  for (const trazo of icono.trazos) {
    svg.append(crearNodoSvg('path', { d: trazo, class: 'icono__trazo' }));
  }
  if (icono.remache) {
    const [cx, cy] = icono.remache;
    svg.append(crearNodoSvg('circle', { cx, cy, r: 1.6, class: 'icono__remache' }));
  }
  return svg;
}

// Logotipo: la navaja abierta, de perfil.
export function crearLogotipo() {
  const svg = crearNodoSvg('svg', {
    viewBox: '0 0 44 28',
    class: 'logotipo',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.append(
    crearNodoSvg('path', { class: 'logotipo__hoja', d: 'M16.5 15.5 42 3c-2 9-11 15-25.5 15z' }),
    crearNodoSvg('path', { class: 'logotipo__cacha', d: 'M2 17h19a3.5 3.5 0 0 1 0 7H5.5A3.5 3.5 0 0 1 2 20.5z' }),
    crearNodoSvg('circle', { class: 'logotipo__remache', cx: 18, cy: 20.5, r: 1.8 }),
  );
  return svg;
}
