// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t, tValor } from '../../nucleo/i18n.js';
import { obtenerHerramienta } from '../../nucleo/registro.js';
import { crearFilaHerramienta } from '../fila-herramienta/fila-herramienta.js';

function crearCabecera(clave) {
  return [
    el('h1', { clase: 'pagina__titulo' }, t(`paginas.${clave}.titulo`)),
    el('p', { clase: 'pagina__descripcion' }, t(`paginas.${clave}.descripcion`)),
  ];
}

export function crearListaPersonal(clave, ids) {
  const herramientas = ids.map(obtenerHerramienta).filter(Boolean);
  return el(
    'div',
    { clase: 'pagina' },
    crearCabecera(clave),
    herramientas.length > 0
      ? el('ul', { clase: 'indice__lista' }, herramientas.map(crearFilaHerramienta))
      : [
          el('p', { clase: 'pagina__vacio' }, t(`paginas.${clave}.vacio`)),
          el('a', { clase: 'boton', href: '/' }, t('portada.verTodas')),
        ],
  );
}

export function crearPaginaInformativa(clave) {
  const parrafos = tValor(`paginas.${clave}.parrafos`);
  const esAcerca = clave === 'acerca-de';
  const repositorio = t('aplicacion.repositorio');
  return el(
    'div',
    { clase: 'pagina' },
    crearCabecera(clave),
    el('div', { clase: 'pagina__texto' }, parrafos.map((parrafo) => el('p', {}, parrafo))),
    esAcerca &&
      el(
        'div',
        { clase: 'pagina__enlaces' },
        el('a', { clase: 'boton', href: repositorio, rel: 'noopener' }, t('paginas.acerca-de.enlaceCodigo')),
        el(
          'a',
          { clase: 'boton', href: 'https://www.gnu.org/licenses/agpl-3.0.html', rel: 'noopener' },
          t('paginas.acerca-de.enlaceLicencia'),
        ),
      ),
  );
}

export function crearPaginaNoEncontrada() {
  return el(
    'div',
    { clase: 'pagina' },
    el('h1', { clase: 'pagina__titulo' }, t('paginas.noEncontrada.titulo')),
    el('p', { clase: 'pagina__descripcion' }, t('paginas.noEncontrada.descripcion')),
    el('a', { clase: 'boton boton--primario', href: '/' }, t('paginas.noEncontrada.enlace')),
  );
}
