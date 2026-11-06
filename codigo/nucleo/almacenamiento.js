// SPDX-License-Identifier: AGPL-3.0-only
// Interfaz única de persistencia, pensada para admitir otra implementación en la v2.
const PREFIJO = 'navaja:';

export function obtener(clave, valorPredeterminado = null) {
  try {
    const guardado = localStorage.getItem(PREFIJO + clave);
    return guardado === null ? valorPredeterminado : JSON.parse(guardado);
  } catch {
    return valorPredeterminado;
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento la aplicación sigue funcionando; solo no recuerda la preferencia.
  }
}

export function quitar(clave) {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch {
    // Nada que quitar si el almacenamiento no está disponible.
  }
}

export function vaciar() {
  try {
    Object.keys(localStorage)
      .filter((clave) => clave.startsWith(PREFIJO))
      .forEach((clave) => localStorage.removeItem(clave));
  } catch {
    // Nada que vaciar si el almacenamiento no está disponible.
  }
}
