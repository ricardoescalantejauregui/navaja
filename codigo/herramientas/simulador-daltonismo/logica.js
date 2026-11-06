// SPDX-License-Identifier: AGPL-3.0-only
// Matrices aproximadas de simulación. Cada fila calcula un canal a partir de rojo, verde y azul.
const MATRICES = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  acromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

// Devuelve una copia de los píxeles RGBA; la transparencia no cambia.
export function simularDaltonismo(pixeles, tipo) {
  const matriz = MATRICES[tipo];
  const resultado = new Uint8ClampedArray(pixeles);
  for (let indice = 0; indice < pixeles.length; indice += 4) {
    const rojo = pixeles[indice];
    const verde = pixeles[indice + 1];
    const azul = pixeles[indice + 2];
    resultado[indice] = rojo * matriz[0] + verde * matriz[1] + azul * matriz[2];
    resultado[indice + 1] = rojo * matriz[3] + verde * matriz[4] + azul * matriz[5];
    resultado[indice + 2] = rojo * matriz[6] + verde * matriz[7] + azul * matriz[8];
  }
  return resultado;
}
