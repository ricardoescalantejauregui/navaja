// SPDX-License-Identifier: AGPL-3.0-only
import { ErrorHerramienta } from '../../nucleo/errores.js';

function decodificarSegmento(segmento) {
  const base64 = segmento.replaceAll('-', '+').replaceAll('_', '/');
  const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const bytes = Uint8Array.from(atob(relleno), (caracter) => caracter.charCodeAt(0));
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

const fechaDeSegundos = (valor) => (typeof valor === 'number' ? new Date(valor * 1000) : null);

export function decodificarJwt(token, ahora = new Date()) {
  const partes = token.trim().split('.');
  if (partes.length !== 3) throw new ErrorHerramienta('JWT_SEGMENTOS');

  let cabecera;
  let carga;
  try {
    cabecera = decodificarSegmento(partes[0]);
    carga = decodificarSegmento(partes[1]);
  } catch {
    throw new ErrorHerramienta('JWT_INVALIDO');
  }

  const expira = fechaDeSegundos(carga.exp);
  return {
    cabecera,
    carga,
    fechas: { emitido: fechaDeSegundos(carga.iat), expira, noAntes: fechaDeSegundos(carga.nbf) },
    expirado: expira ? expira < ahora : null,
  };
}
