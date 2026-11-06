// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

const PATRON_PEM = /-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/;

function longitudDeclarada(der) {
  const primerByte = der[1];
  if (primerByte < 0x80) return { contenido: primerByte, cabecera: 2 };
  const cantidad = primerByte & 0x7f;
  let contenido = 0;
  for (let indice = 0; indice < cantidad; indice += 1) contenido = contenido * 256 + der[2 + indice];
  return { contenido, cabecera: 2 + cantidad };
}

// Comprueba la envoltura PEM y que la secuencia DER exterior tenga la longitud que declara.
export function comprobarCertificado(texto) {
  const coincidencia = texto.match(PATRON_PEM);
  if (!coincidencia) throw new ErrorHerramienta('CERTIFICADO_INVALIDO');

  let der;
  try {
    der = Uint8Array.from(atob(coincidencia[1].replace(/\s/g, '')), (caracter) => caracter.charCodeAt(0));
  } catch {
    throw new ErrorHerramienta('CERTIFICADO_INVALIDO');
  }

  if (der.length < 2 || der[0] !== 0x30) throw new ErrorHerramienta('CERTIFICADO_INVALIDO');
  const { contenido, cabecera } = longitudDeclarada(der);
  if (contenido + cabecera !== der.length) throw new ErrorHerramienta('CERTIFICADO_INVALIDO');
  return { tamano: der.length };
}
