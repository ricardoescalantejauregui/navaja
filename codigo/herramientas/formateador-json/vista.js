// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco, crearSalidaTexto } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { formatearJson, minificarJson } from './logica.js';

export function crearVista() {
  return crearMarco({
    id: 'formateador-json',
    entrada: { archivoComoTexto: true },
    opciones: [
      { nombre: 'accion', valores: ['formatear', 'minificar'] },
      { nombre: 'sangria', valores: ['2', '4', 'tab'], visibleSi: (valores) => valores.accion === 'formatear' },
    ],
    salida: crearSalidaTexto({ archivo: { nombre: 'resultado.json', tipo: 'application/json' } }),
    procesar: ({ texto, opciones }) =>
      opciones.accion === 'minificar' ? minificarJson(texto) : formatearJson(texto, opciones.sangria),
  });
}
