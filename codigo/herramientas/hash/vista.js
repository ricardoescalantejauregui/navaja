// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { calcularHash } from './logica.js';

export function crearVista() {
  return crearMarco({
    id: 'hash',
    entrada: { archivoOpcional: true },
    opciones: [{ nombre: 'algoritmo', valores: ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'] }],
    procesar: async ({ texto, archivo, opciones }) => {
      const datos = archivo ? await archivo.arrayBuffer() : texto;
      return calcularHash(datos, opciones.algoritmo);
    },
  });
}
