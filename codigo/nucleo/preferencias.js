// SPDX-License-Identifier: AGPL-3.0-only
import { guardar, obtener } from './almacenamiento.js';

const MAXIMO_RECIENTES = 10;

export const obtenerFavoritos = () => obtener('favoritos', []);
export const esFavorito = (id) => obtenerFavoritos().includes(id);

// Devuelve true si la herramienta quedó marcada como favorita.
export function alternarFavorito(id) {
  const favoritos = obtenerFavoritos();
  const marcada = !favoritos.includes(id);
  guardar('favoritos', marcada ? [...favoritos, id] : favoritos.filter((favorito) => favorito !== id));
  return marcada;
}

export const obtenerRecientes = () => obtener('recientes', []);

export function registrarReciente(id) {
  const resto = obtenerRecientes().filter((reciente) => reciente !== id);
  guardar('recientes', [id, ...resto].slice(0, MAXIMO_RECIENTES));
}

export const obtenerPerfil = () => obtener('perfil', 'todos');
export const guardarPerfil = (perfil) => guardar('perfil', perfil);
