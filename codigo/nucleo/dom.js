// SPDX-License-Identifier: AGPL-3.0-only
// Crea un elemento con sus atributos, eventos e hijos, sin recurrir a innerHTML.
export function el(etiqueta, atributos = {}, ...hijos) {
  const elemento = document.createElement(etiqueta);

  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (nombre === 'clase') {
      elemento.className = valor;
    } else if (nombre === 'eventos') {
      for (const [evento, manejador] of Object.entries(valor)) {
        elemento.addEventListener(evento, manejador);
      }
    } else if (nombre === 'valor') {
      elemento.value = valor;
    } else if (valor === true) {
      elemento.setAttribute(nombre, '');
    } else {
      elemento.setAttribute(nombre, valor);
    }
  }

  agregarHijos(elemento, hijos);
  return elemento;
}

function agregarHijos(elemento, hijos) {
  for (const hijo of hijos.flat(Infinity)) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    elemento.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
  }
}

export function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const enlace = el('a', { href: url, download: nombre });
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
