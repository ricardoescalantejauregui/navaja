// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { codificarUrl, decodificarUrl } from './logica.js';

export function crearVista() {
  return crearMarco({
    id: 'codificador-url',
    opciones: [
      { nombre: 'accion', valores: ['codificar', 'decodificar'] },
      { nombre: 'alcance', valores: ['componente', 'completa'] },
    ],
    procesar: ({ texto, opciones }) =>
      opciones.accion === 'codificar' ? codificarUrl(texto, opciones.alcance) : decodificarUrl(texto, opciones.alcance),
  });
}
