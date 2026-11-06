// SPDX-License-Identifier: AGPL-3.0-only
import { guardar, obtener } from './almacenamiento.js';

const ORDEN = ['sistema', 'claro', 'oscuro'];

export const obtenerTema = () => obtener('tema', 'sistema');

export function aplicarTema(tema) {
  if (tema === 'sistema') {
    delete document.documentElement.dataset.tema;
  } else {
    document.documentElement.dataset.tema = tema;
  }
}

export function alternarTema() {
  const actual = obtenerTema();
  const siguiente = ORDEN[(ORDEN.indexOf(actual) + 1) % ORDEN.length];
  guardar('tema', siguiente);
  aplicarTema(siguiente);
  return siguiente;
}
