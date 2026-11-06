// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { desescapar, escapar } from './logica.js';

export function crearVista() {
  return crearMarco({
    id: 'escapar-cadenas',
    opciones: [
      { nombre: 'accion', valores: ['escapar', 'desescapar'] },
      { nombre: 'formato', valores: ['html', 'json', 'javascript', 'url'] },
    ],
    procesar: ({ texto, opciones }) =>
      opciones.accion === 'escapar' ? escapar(texto, opciones.formato) : desescapar(texto, opciones.formato),
  });
}
