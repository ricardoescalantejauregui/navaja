// SPDX-License-Identifier: AGPL-3.0-only
export async function calcularHash(datos, algoritmo = 'SHA-256') {
  const bytes = typeof datos === 'string' ? new TextEncoder().encode(datos) : datos;
  const resumen = await crypto.subtle.digest(algoritmo, bytes);
  return Array.from(new Uint8Array(resumen), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
