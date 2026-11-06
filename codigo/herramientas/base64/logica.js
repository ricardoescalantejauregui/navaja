// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

export function codificarBase64(texto, variante = 'estandar') {
  const bytes = new TextEncoder().encode(texto);
  const base64 = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
  if (variante !== 'url') return base64;
  return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function decodificarBase64(texto, variante = 'estandar') {
  let limpio = texto.replace(/\s/g, '');
  if (variante === 'url') limpio = limpio.replaceAll('-', '+').replaceAll('_', '/');
  limpio = limpio.padEnd(limpio.length + ((4 - (limpio.length % 4)) % 4), '=');

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(limpio)) throw new ErrorHerramienta('BASE64_INVALIDO');
  try {
    const bytes = Uint8Array.from(atob(limpio), (caracter) => caracter.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new ErrorHerramienta('BASE64_INVALIDO');
  }
}
