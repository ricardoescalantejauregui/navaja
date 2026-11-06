// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco, crearSalidaTexto } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { codificarBase64, decodificarBase64 } from './logica.js';

export function crearVista() {
  return crearMarco({
    id: 'base64',
    entrada: { archivoComoTexto: true },
    opciones: [
      { nombre: 'accion', valores: ['codificar', 'decodificar'] },
      { nombre: 'variante', valores: ['estandar', 'url'] },
    ],
    salida: crearSalidaTexto({ archivo: { nombre: 'resultado.txt', tipo: 'text/plain' } }),
    procesar: ({ texto, opciones }) =>
      opciones.accion === 'codificar'
        ? codificarBase64(texto, opciones.variante)
        : decodificarBase64(texto, opciones.variante),
  });
}
