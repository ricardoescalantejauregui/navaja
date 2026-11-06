// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

const EXTENSIONES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
};

export function bytesADataUri(bytes, tipo) {
  const binario = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return `data:${tipo || 'application/octet-stream'};base64,${btoa(binario)}`;
}

export function analizarDataUri(texto) {
  const coincidencia = texto.trim().match(/^data:([\w.+-]+\/[\w.+-]+)?(?:;[\w=-]+)*;base64,([A-Za-z0-9+/\s]*={0,2})$/);
  if (!coincidencia) throw new ErrorHerramienta('DATA_URI_INVALIDO');
  try {
    const bytes = Uint8Array.from(atob(coincidencia[2].replace(/\s/g, '')), (caracter) => caracter.charCodeAt(0));
    return { tipo: coincidencia[1] ?? 'application/octet-stream', bytes };
  } catch {
    throw new ErrorHerramienta('DATA_URI_INVALIDO');
  }
}

export const extensionDe = (tipo) => EXTENSIONES[tipo] ?? 'bin';
