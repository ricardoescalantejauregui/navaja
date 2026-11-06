// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { crearIcono } from '../../nucleo/iconos.js';
import { alternarFavorito, esFavorito } from '../../nucleo/preferencias.js';

function crearBotonFavorito(id, nombre) {
  const boton = el('button', { clase: 'boton boton--solo-icono fila-herramienta__favorito', type: 'button' });

  function pintar(marcada) {
    boton.replaceChildren(crearIcono('estrella', marcada ? 'icono--relleno' : ''));
    boton.setAttribute('aria-pressed', String(marcada));
    boton.setAttribute('aria-label', t(marcada ? 'favoritos.quitarDe' : 'favoritos.agregarDe', { nombre }));
  }

  boton.addEventListener('click', () => pintar(alternarFavorito(id)));
  pintar(esFavorito(id));
  return boton;
}

export function crearFilaHerramienta({ id, icono }) {
  const nombre = t(`herramientas.${id}.nombre`);
  return el(
    'li',
    { clase: 'fila-herramienta' },
    el(
      'a',
      { clase: 'fila-herramienta__enlace', href: `/${id}/` },
      crearIcono(icono),
      el('span', { clase: 'fila-herramienta__nombre' }, nombre),
      el('span', { clase: 'fila-herramienta__descripcion' }, t(`herramientas.${id}.descripcion`)),
    ),
    crearBotonFavorito(id, nombre),
  );
}
