// SPDX-License-Identifier: AGPL-3.0-only
// Generador QR propio, en modo byte, a partir de la norma ISO/IEC 18004.
import { ErrorHerramienta } from '../../nucleo/errores.js';

const VERSION_MAXIMA = 40;
const NIVELES = { L: 1, M: 0, Q: 3, H: 2 };

// Palabras de corrección por bloque y número de bloques, por versión (el índice 0 no se usa).
const CORRECCION_POR_BLOQUE = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const BLOQUES = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

function modulosDeDatos(version) {
  let total = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const alineaciones = Math.floor(version / 7) + 2;
    total -= (25 * alineaciones - 10) * alineaciones - 55;
    if (version >= 7) total -= 36;
  }
  return total;
}

const palabrasTotales = (version) => Math.floor(modulosDeDatos(version) / 8);
const palabrasDeDatos = (version, nivel) =>
  palabrasTotales(version) - CORRECCION_POR_BLOQUE[nivel][version] * BLOQUES[nivel][version];

function elegirVersion(longitud, nivel) {
  for (let version = 1; version <= VERSION_MAXIMA; version += 1) {
    const bitsDeLongitud = version < 10 ? 8 : 16;
    if (4 + bitsDeLongitud + longitud * 8 <= palabrasDeDatos(version, nivel) * 8) return version;
  }
  throw new ErrorHerramienta('QR_DEMASIADO_LARGO');
}

function codificarDatos(bytes, version, nivel) {
  const bits = [];
  const agregar = (valor, cantidad) => {
    for (let indice = cantidad - 1; indice >= 0; indice -= 1) bits.push((valor >>> indice) & 1);
  };
  agregar(0b0100, 4);
  agregar(bytes.length, version < 10 ? 8 : 16);
  bytes.forEach((byte) => agregar(byte, 8));

  const capacidad = palabrasDeDatos(version, nivel) * 8;
  agregar(0, Math.min(4, capacidad - bits.length));
  agregar(0, (8 - (bits.length % 8)) % 8);
  for (let relleno = 0xec; bits.length < capacidad; relleno ^= 0xec ^ 0x11) agregar(relleno, 8);

  const palabras = [];
  for (let indice = 0; indice < bits.length; indice += 8) {
    palabras.push(bits.slice(indice, indice + 8).reduce((valor, bit) => (valor << 1) | bit, 0));
  }
  return palabras;
}

function multiplicarCampo(a, b) {
  let resultado = 0;
  for (let indice = 7; indice >= 0; indice -= 1) {
    resultado = (resultado << 1) ^ ((resultado >>> 7) * 0x11d);
    resultado ^= ((b >>> indice) & 1) * a;
  }
  return resultado;
}

function crearDivisor(grado) {
  const divisor = new Array(grado).fill(0);
  divisor[grado - 1] = 1;
  let raiz = 1;
  for (let vuelta = 0; vuelta < grado; vuelta += 1) {
    for (let indice = 0; indice < grado; indice += 1) {
      divisor[indice] = multiplicarCampo(divisor[indice], raiz);
      if (indice + 1 < grado) divisor[indice] ^= divisor[indice + 1];
    }
    raiz = multiplicarCampo(raiz, 2);
  }
  return divisor;
}

function calcularCorreccion(datos, divisor) {
  const resto = new Array(divisor.length).fill(0);
  for (const byte of datos) {
    const factor = byte ^ resto.shift();
    resto.push(0);
    divisor.forEach((coeficiente, indice) => {
      resto[indice] ^= multiplicarCampo(coeficiente, factor);
    });
  }
  return resto;
}

function entrelazarBloques(datos, version, nivel) {
  const cantidadBloques = BLOQUES[nivel][version];
  const correccion = CORRECCION_POR_BLOQUE[nivel][version];
  const total = palabrasTotales(version);
  const cortos = cantidadBloques - (total % cantidadBloques);
  const longitudCorta = Math.floor(total / cantidadBloques);
  const divisor = crearDivisor(correccion);
  const bloques = [];

  for (let indice = 0, inicio = 0; indice < cantidadBloques; indice += 1) {
    const longitud = longitudCorta - correccion + (indice < cortos ? 0 : 1);
    const parte = datos.slice(inicio, inicio + longitud);
    inicio += longitud;
    const redundancia = calcularCorreccion(parte, divisor);
    if (indice < cortos) parte.push(0);
    bloques.push([...parte, ...redundancia]);
  }

  const resultado = [];
  for (let columna = 0; columna < bloques[0].length; columna += 1) {
    bloques.forEach((bloque, fila) => {
      if (columna !== longitudCorta - correccion || fila >= cortos) resultado.push(bloque[columna]);
    });
  }
  return resultado;
}

function posicionesDeAlineacion(version) {
  if (version === 1) return [];
  const cantidad = Math.floor(version / 7) + 2;
  const paso = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (cantidad * 2 - 2)) * 2;
  const posiciones = [6];
  for (let posicion = version * 4 + 10; posiciones.length < cantidad; posicion -= paso) {
    posiciones.splice(1, 0, posicion);
  }
  return posiciones;
}

function dibujarPatrones(matriz, reservado, version) {
  const tamano = matriz.length;
  const fijar = (x, y, valor) => {
    if (x < 0 || y < 0 || x >= tamano || y >= tamano) return;
    matriz[y][x] = valor;
    reservado[y][x] = true;
  };

  for (let indice = 0; indice < tamano; indice += 1) {
    fijar(6, indice, indice % 2 === 0);
    fijar(indice, 6, indice % 2 === 0);
  }

  for (const [centroX, centroY] of [[3, 3], [tamano - 4, 3], [3, tamano - 4]]) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const distancia = Math.max(Math.abs(dx), Math.abs(dy));
        fijar(centroX + dx, centroY + dy, distancia !== 2 && distancia !== 4);
      }
    }
  }

  const alineaciones = posicionesDeAlineacion(version);
  alineaciones.forEach((y, fila) => {
    alineaciones.forEach((x, columna) => {
      const esquina =
        (fila === 0 && columna === 0) ||
        (fila === 0 && columna === alineaciones.length - 1) ||
        (fila === alineaciones.length - 1 && columna === 0);
      if (esquina) return;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          fijar(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    });
  });

  if (version >= 7) {
    let resto = version;
    for (let indice = 0; indice < 12; indice += 1) resto = (resto << 1) ^ ((resto >>> 11) * 0x1f25);
    const bits = (version << 12) | resto;
    for (let indice = 0; indice < 18; indice += 1) {
      const bit = ((bits >>> indice) & 1) === 1;
      const a = tamano - 11 + (indice % 3);
      const b = Math.floor(indice / 3);
      fijar(a, b, bit);
      fijar(b, a, bit);
    }
  }
}

function dibujarFormato(matriz, reservado, nivel, mascara) {
  const tamano = matriz.length;
  const datos = (NIVELES[nivel] << 3) | mascara;
  let resto = datos;
  for (let indice = 0; indice < 10; indice += 1) resto = (resto << 1) ^ ((resto >>> 9) * 0x537);
  const bits = ((datos << 10) | resto) ^ 0x5412;
  const bit = (indice) => ((bits >>> indice) & 1) === 1;
  const fijar = (x, y, valor) => {
    matriz[y][x] = valor;
    reservado[y][x] = true;
  };

  for (let indice = 0; indice <= 5; indice += 1) fijar(8, indice, bit(indice));
  fijar(8, 7, bit(6));
  fijar(8, 8, bit(7));
  fijar(7, 8, bit(8));
  for (let indice = 9; indice < 15; indice += 1) fijar(14 - indice, 8, bit(indice));
  for (let indice = 0; indice < 8; indice += 1) fijar(tamano - 1 - indice, 8, bit(indice));
  for (let indice = 8; indice < 15; indice += 1) fijar(8, tamano - 15 + indice, bit(indice));
  fijar(8, tamano - 8, true);
}

function dibujarDatos(matriz, reservado, palabras) {
  const tamano = matriz.length;
  let indiceBit = 0;
  for (let derecha = tamano - 1; derecha >= 1; derecha -= 2) {
    if (derecha === 6) derecha = 5;
    const haciaArriba = ((derecha + 1) & 2) === 0;
    for (let vertical = 0; vertical < tamano; vertical += 1) {
      for (let lado = 0; lado < 2; lado += 1) {
        const x = derecha - lado;
        const y = haciaArriba ? tamano - 1 - vertical : vertical;
        if (reservado[y][x] || indiceBit >= palabras.length * 8) continue;
        matriz[y][x] = ((palabras[indiceBit >>> 3] >>> (7 - (indiceBit & 7))) & 1) === 1;
        indiceBit += 1;
      }
    }
  }
}

const MASCARAS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function aplicarMascara(matriz, reservado, mascara) {
  return matriz.map((fila, y) => fila.map((valor, x) => (reservado[y][x] ? valor : valor !== MASCARAS[mascara](x, y))));
}

function penalizarLinea(linea) {
  let penalizacion = 0;
  let racha = 1;
  for (let indice = 1; indice <= linea.length; indice += 1) {
    if (indice < linea.length && linea[indice] === linea[indice - 1]) {
      racha += 1;
    } else {
      if (racha >= 5) penalizacion += racha - 2;
      racha = 1;
    }
  }
  const texto = linea.map((valor) => (valor ? '1' : '0')).join('');
  for (const patron of ['10111010000', '00001011101']) {
    penalizacion += (texto.split(patron).length - 1) * 40;
  }
  return penalizacion;
}

function calcularPenalizacion(matriz) {
  const tamano = matriz.length;
  let penalizacion = 0;
  let oscuros = 0;
  for (let indice = 0; indice < tamano; indice += 1) {
    penalizacion += penalizarLinea(matriz[indice]);
    penalizacion += penalizarLinea(matriz.map((fila) => fila[indice]));
  }
  for (let y = 0; y < tamano; y += 1) {
    for (let x = 0; x < tamano; x += 1) {
      if (matriz[y][x]) oscuros += 1;
      if (
        x + 1 < tamano &&
        y + 1 < tamano &&
        matriz[y][x] === matriz[y][x + 1] &&
        matriz[y][x] === matriz[y + 1][x] &&
        matriz[y][x] === matriz[y + 1][x + 1]
      ) {
        penalizacion += 3;
      }
    }
  }
  const desviacion = Math.abs((oscuros * 100) / (tamano * tamano) - 50);
  return penalizacion + Math.floor(desviacion / 5) * 10;
}

// Devuelve la matriz del código: true es un módulo oscuro.
export function generarMatrizQr(texto, nivel = 'M') {
  const bytes = [...new TextEncoder().encode(texto)];
  const version = elegirVersion(bytes.length, nivel);
  const palabras = entrelazarBloques(codificarDatos(bytes, version, nivel), version, nivel);
  const tamano = version * 4 + 17;
  const base = Array.from({ length: tamano }, () => new Array(tamano).fill(false));
  const reservado = Array.from({ length: tamano }, () => new Array(tamano).fill(false));

  dibujarPatrones(base, reservado, version);
  dibujarFormato(base, reservado, nivel, 0);
  dibujarDatos(base, reservado, palabras);

  let mejor = null;
  let menorPenalizacion = Infinity;
  MASCARAS.forEach((_, mascara) => {
    const candidata = aplicarMascara(base, reservado, mascara);
    dibujarFormato(candidata, reservado, nivel, mascara);
    const penalizacion = calcularPenalizacion(candidata);
    if (penalizacion < menorPenalizacion) {
      mejor = candidata;
      menorPenalizacion = penalizacion;
    }
  });
  return mejor;
}

export function matrizASvg(matriz, margen = 4) {
  const lado = matriz.length + margen * 2;
  const trazos = [];
  matriz.forEach((fila, y) => {
    fila.forEach((oscuro, x) => {
      if (oscuro) trazos.push(`M${x + margen} ${y + margen}h1v1h-1z`);
    });
  });
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" shape-rendering="crispEdges">`,
    `<rect width="${lado}" height="${lado}" fill="#fff"/>`,
    `<path fill="#000" d="${trazos.join('')}"/>`,
    '</svg>',
  ].join('');
}
