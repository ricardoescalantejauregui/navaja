// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

export function codificarUrl(texto, alcance = 'componente') {
  return alcance === 'completa' ? encodeURI(texto) : encodeURIComponent(texto);
}

export function decodificarUrl(texto, alcance = 'componente') {
  try {
    return alcance === 'completa' ? decodeURI(texto) : decodeURIComponent(texto);
  } catch {
    throw new ErrorHerramienta('URL_INVALIDA');
  }
}
