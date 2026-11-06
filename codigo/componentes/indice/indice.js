// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { crearFilaHerramienta } from '../fila-herramienta/fila-herramienta.js';

export function crearGrupoIndice({ categoria, herramientas }) {
  const idTitulo = `categoria-${categoria}`;
  return el(
    'section',
    { clase: 'indice__grupo', 'aria-labelledby': idTitulo },
    el('h2', { clase: 'indice__titulo', id: idTitulo }, t(`categorias.${categoria}`)),
    el('ul', { clase: 'indice__lista' }, herramientas.map(crearFilaHerramienta)),
  );
}
