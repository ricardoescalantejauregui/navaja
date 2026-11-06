// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { crearIcono, crearLogotipo } from '../../nucleo/iconos.js';
import { alternarTema, obtenerTema } from '../../nucleo/tema.js';

const ICONO_TEMA = { sistema: 'sistema', claro: 'sol', oscuro: 'luna' };

function crearEnlace(ruta, icono, texto) {
  return el(
    'a',
    { clase: 'encabezado__enlace', href: ruta },
    crearIcono(icono),
    el('span', { clase: 'encabezado__texto' }, texto),
  );
}

function crearBotonTema() {
  const boton = el('button', { clase: 'boton boton--solo-icono', type: 'button' });

  function pintar(tema) {
    boton.replaceChildren(crearIcono(ICONO_TEMA[tema]));
    boton.setAttribute('aria-label', t(`encabezado.tema.${tema}`));
    boton.title = t(`encabezado.tema.${tema}`);
  }

  boton.addEventListener('click', () => pintar(alternarTema()));
  pintar(obtenerTema());
  return boton;
}

export function crearEncabezado() {
  const enlaceBuscar = crearEnlace('/', 'lupa', t('encabezado.buscar'));
  const enlaces = [
    enlaceBuscar,
    crearEnlace('/favoritos/', 'estrella', t('encabezado.favoritos')),
    crearEnlace('/recientes/', 'historial', t('encabezado.recientes')),
  ];

  const elemento = el(
    'header',
    { clase: 'encabezado' },
    el(
      'a',
      { clase: 'encabezado__marca', href: '/', 'aria-label': t('encabezado.inicio'), translate: 'no' },
      crearLogotipo(),
      t('aplicacion.nombre'),
    ),
    el('nav', { clase: 'encabezado__acciones', 'aria-label': t('encabezado.navegacion') }, enlaces, crearBotonTema()),
  );

  function actualizar(esPortada, ruta) {
    enlaceBuscar.hidden = esPortada;
    for (const enlace of enlaces) {
      if (enlace !== enlaceBuscar && enlace.getAttribute('href') === ruta) {
        enlace.setAttribute('aria-current', 'page');
      } else {
        enlace.removeAttribute('aria-current');
      }
    }
  }

  return { elemento, actualizar };
}
