// SPDX-License-Identifier: AGPL-3.0-only
let textos = {};

export async function cargarTextos() {
  const respuesta = await fetch('/i18n/es.json');
  textos = await respuesta.json();
}

export function definirTextos(nuevosTextos) {
  textos = nuevosTextos;
}

function buscar(clave) {
  return clave.split('.').reduce((nodo, parte) => (nodo === undefined ? undefined : nodo[parte]), textos);
}

// Devuelve el texto de la clave e interpola los valores escritos como {nombre}.
export function t(clave, datos = {}) {
  const valor = buscar(clave);
  if (typeof valor !== 'string') return clave;
  return valor.replace(/\{(\w+)\}/g, (completo, nombre) => (nombre in datos ? String(datos[nombre]) : completo));
}

// Devuelve valores que no son texto, como listas de párrafos.
export function tValor(clave) {
  return buscar(clave);
}
