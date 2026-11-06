// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

const PATRON_CADENA = /"(?:[^"\\\u0000-\u001f]|\\["\\/bfnrt]|\\u[0-9a-fA-F]{4})*"/y;
const PATRON_ATOMO = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/y;

// Recorre el texto y devuelve el índice del primer error. Los mensajes del motor no siempre lo indican.
function localizarError(texto) {
  let indice = 0;

  const omitirEspacios = () => {
    while (indice < texto.length && ' \n\r\t'.includes(texto[indice])) indice += 1;
  };
  const consumir = (patron) => {
    patron.lastIndex = indice;
    const coincidencia = patron.exec(texto);
    if (!coincidencia) throw indice;
    indice += coincidencia[0].length;
  };
  const exigir = (caracter) => {
    omitirEspacios();
    if (texto[indice] !== caracter) throw indice;
    indice += 1;
  };

  function leerColeccion(cierre, leerElemento) {
    indice += 1;
    omitirEspacios();
    if (texto[indice] === cierre) {
      indice += 1;
      return;
    }
    for (;;) {
      leerElemento();
      omitirEspacios();
      if (texto[indice] === cierre) {
        indice += 1;
        return;
      }
      exigir(',');
    }
  }

  function leerValor() {
    omitirEspacios();
    if (texto[indice] === '{') {
      leerColeccion('}', () => {
        omitirEspacios();
        consumir(PATRON_CADENA);
        exigir(':');
        leerValor();
      });
    } else if (texto[indice] === '[') {
      leerColeccion(']', leerValor);
    } else if (texto[indice] === '"') {
      consumir(PATRON_CADENA);
    } else {
      consumir(PATRON_ATOMO);
    }
  }

  try {
    leerValor();
    omitirEspacios();
    return indice < texto.length ? indice : null;
  } catch (posicion) {
    return posicion;
  }
}

function analizarJson(texto) {
  try {
    return JSON.parse(texto);
  } catch {
    const posicion = localizarError(texto);
    if (posicion === null) throw new ErrorHerramienta('JSON_INVALIDO_SIN_POSICION');
    const lineas = texto.slice(0, posicion).split('\n');
    throw new ErrorHerramienta('JSON_INVALIDO', { linea: lineas.length, columna: lineas.at(-1).length + 1 });
  }
}

export function formatearJson(texto, sangria = '2') {
  return JSON.stringify(analizarJson(texto), null, sangria === 'tab' ? '\t' : Number(sangria));
}

export function minificarJson(texto) {
  return JSON.stringify(analizarJson(texto));
}
