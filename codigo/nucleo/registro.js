// SPDX-License-Identifier: AGPL-3.0-only
// Búsqueda y filtrado del catálogo. Funciones puras para poder probarlas sin navegador.

export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('es')
    .trim();
}

function textoBuscable(herramienta, traducir) {
  return normalizar(
    [
      traducir(`herramientas.${herramienta.id}.nombre`),
      traducir(`herramientas.${herramienta.id}.descripcion`),
      ...herramienta.palabrasClave,
    ].join(' '),
  );
}

// Todas las palabras de la consulta deben aparecer, en cualquier orden.
export function filtrarHerramientas(herramientas, { consulta = '', perfil = 'todos' }, traducir) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  return herramientas.filter((herramienta) => {
    if (perfil !== 'todos' && !herramienta.perfil.includes(perfil)) return false;
    const texto = textoBuscable(herramienta, traducir);
    return palabras.every((palabra) => texto.includes(palabra));
  });
}

export function agruparPorCategoria(herramientas, categorias) {
  return categorias
    .map((categoria) => ({
      categoria,
      herramientas: herramientas.filter((herramienta) => herramienta.categoria === categoria),
    }))
    .filter((grupo) => grupo.herramientas.length > 0);
}

let manifiesto = { categorias: [], herramientas: [] };

export async function cargarManifiesto() {
  const respuesta = await fetch('/herramientas.manifiesto.json');
  manifiesto = await respuesta.json();
}

export const obtenerHerramientas = () => manifiesto.herramientas;
export const obtenerCategorias = () => manifiesto.categorias;
export const obtenerHerramienta = (id) => manifiesto.herramientas.find((herramienta) => herramienta.id === id);
