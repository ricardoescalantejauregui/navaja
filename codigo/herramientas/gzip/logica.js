// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

async function transformar(bytes, Transformador) {
  if (typeof Transformador === 'undefined') throw new ErrorHerramienta('GZIP_NO_DISPONIBLE');
  const flujo = new Blob([bytes]).stream().pipeThrough(new Transformador('gzip'));
  return new Uint8Array(await new Response(flujo).arrayBuffer());
}

export async function comprimirGzip(texto) {
  const original = new TextEncoder().encode(texto);
  const comprimido = await transformar(original, globalThis.CompressionStream);
  return {
    base64: btoa(Array.from(comprimido, (byte) => String.fromCharCode(byte)).join('')),
    antes: original.length,
    despues: comprimido.length,
  };
}

export async function descomprimirGzip(base64) {
  try {
    const bytes = Uint8Array.from(atob(base64.replace(/\s/g, '')), (caracter) => caracter.charCodeAt(0));
    const resultado = await transformar(bytes, globalThis.DecompressionStream);
    return new TextDecoder().decode(resultado);
  } catch (error) {
    if (error instanceof ErrorHerramienta) throw error;
    throw new ErrorHerramienta('GZIP_INVALIDO');
  }
}
