// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const CARACTERES_DE_ENTIDAD = Object.fromEntries(Object.entries(ENTIDADES).map(([caracter, entidad]) => [entidad, caracter]));
const ESCAPES_JS = { '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t', "'": "\\'", '"': '\\"' };
const CARACTERES_JS = { n: '\n', r: '\r', t: '\t', '\\': '\\', "'": "'", '"': '"' };

export function escapar(texto, formato) {
  if (formato === 'html') return texto.replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter]);
  if (formato === 'json') return JSON.stringify(texto).slice(1, -1);
  if (formato === 'url') return encodeURIComponent(texto);
  return texto.replace(/[\\\n\r\t'"]/g, (caracter) => ESCAPES_JS[caracter]);
}

export function desescapar(texto, formato) {
  try {
    if (formato === 'html') {
      return texto.replace(/&(?:amp|lt|gt|quot|#39);/g, (entidad) => CARACTERES_DE_ENTIDAD[entidad]);
    }
    if (formato === 'json') return JSON.parse(`"${texto}"`);
    if (formato === 'url') return decodeURIComponent(texto);
    return texto.replace(/\\(.)/gs, (completo, caracter) => CARACTERES_JS[caracter] ?? completo);
  } catch {
    throw new ErrorHerramienta('ESCAPE_INVALIDO');
  }
}
