// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';

let contador = 0;

// Grupo de opciones excluyentes: radios nativos, para conservar el teclado y los lectores de pantalla.
export function crearSegmentado({ nombre, leyenda, valores, etiqueta, inicial, alCambiar }) {
  contador += 1;
  const grupo = `${nombre}-${contador}`;
  const radios = new Map();

  const opciones = valores.map((valor) => {
    const radio = el('input', {
      clase: 'segmentado__radio',
      type: 'radio',
      name: grupo,
      valor,
      eventos: { change: () => alCambiar(valor) },
    });
    radio.checked = valor === inicial;
    radios.set(valor, radio);
    return el(
      'label',
      { clase: 'segmentado__opcion' },
      radio,
      el('span', { clase: 'segmentado__texto' }, etiqueta(valor)),
    );
  });

  const elemento = el(
    'fieldset',
    { clase: 'segmentado' },
    el('legend', { clase: 'segmentado__leyenda' }, leyenda),
    el('div', { clase: 'segmentado__opciones' }, opciones),
  );

  return {
    elemento,
    fijar(valor) {
      radios.get(valor).checked = true;
    },
  };
}
