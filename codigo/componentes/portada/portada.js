// SPDX-License-Identifier: AGPL-3.0-only
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { crearIcono } from '../../nucleo/iconos.js';
import {
  agruparPorCategoria,
  filtrarHerramientas,
  obtenerCategorias,
  obtenerHerramientas,
} from '../../nucleo/registro.js';
import { guardarPerfil, obtenerPerfil } from '../../nucleo/preferencias.js';
import { crearSegmentado } from '../segmentado/segmentado.js';
import { crearGrupoIndice } from '../indice/indice.js';

const PERFILES = ['todos', 'dev', 'uxui', 'grafico'];
const ID_BUSCADOR = 'buscador-herramientas';
let consulta = '';

export function enfocarBuscador() {
  const campo = document.getElementById(ID_BUSCADOR);
  campo?.focus();
  campo?.select();
}

function crearBuscador({ desplegar, alEscribir }) {
  const campo = el('input', {
    clase: 'buscador__campo',
    id: ID_BUSCADOR,
    type: 'search',
    autocomplete: 'off',
    spellcheck: 'false',
    placeholder: t('portada.ayudaBusqueda'),
    valor: consulta,
    eventos: { input: (evento) => alEscribir(evento.target.value) },
  });

  return el(
    'form',
    {
      clase: `buscador${desplegar ? ' buscador--desplegar' : ''}`,
      role: 'search',
      eventos: { submit: (evento) => evento.preventDefault() },
    },
    el('label', { clase: 'visualmente-oculto', for: ID_BUSCADOR }, t('portada.etiquetaBusqueda')),
    el('div', { clase: 'buscador__cacha' }, crearIcono('lupa')),
    el('div', { clase: 'buscador__virola' }),
    el(
      'div',
      { clase: 'buscador__hoja' },
      el(
        'div',
        { clase: 'buscador__acero' },
        campo,
        el('kbd', { clase: 'buscador__atajo', 'aria-hidden': 'true' }, t('portada.atajo')),
      ),
    ),
  );
}

function crearVacio({ alLimpiar, perfil }) {
  const hayConsulta = consulta.trim() !== '';
  return el(
    'div',
    { clase: 'portada__vacio' },
    el(
      'h2',
      { clase: 'portada__vacio-titulo' },
      hayConsulta ? t('portada.sinResultados', { consulta }) : t('portada.sinPerfil'),
    ),
    hayConsulta && el('p', { clase: 'portada__vacio-texto' }, t('portada.sinResultadosAyuda')),
    (hayConsulta || perfil !== 'todos') &&
      el(
        'button',
        { clase: 'boton', type: 'button', eventos: { click: alLimpiar } },
        hayConsulta ? t('portada.limpiarBusqueda') : t('portada.verTodas'),
      ),
  );
}

export function crearPortada({ desplegar }) {
  let perfil = obtenerPerfil();
  const indice = el('div', { clase: 'indice' });
  const resultados = el('p', { clase: 'portada__resultados', role: 'status' });
  let segmentadoPerfil;

  function pintarIndice() {
    const lista = filtrarHerramientas(obtenerHerramientas(), { consulta, perfil }, t);
    resultados.textContent =
      lista.length === 1 ? t('portada.resultadoUno') : t('portada.resultados', { cantidad: lista.length });

    if (lista.length === 0) {
      indice.replaceChildren(crearVacio({ alLimpiar: limpiar, perfil }));
      return;
    }
    const grupos = agruparPorCategoria(lista, obtenerCategorias());
    indice.replaceChildren(...grupos.map(crearGrupoIndice));
  }

  function limpiar() {
    if (consulta.trim() !== '') {
      consulta = '';
      const campo = document.getElementById(ID_BUSCADOR);
      campo.value = '';
      campo.focus();
    } else {
      perfil = 'todos';
      guardarPerfil(perfil);
      segmentadoPerfil.fijar(perfil);
    }
    pintarIndice();
  }

  segmentadoPerfil = crearSegmentado({
    nombre: 'perfil',
    leyenda: t('portada.perfil'),
    valores: PERFILES,
    etiqueta: (valor) => t(`portada.perfiles.${valor}`),
    inicial: perfil,
    alCambiar: (valor) => {
      perfil = valor;
      guardarPerfil(valor);
      pintarIndice();
    },
  });

  pintarIndice();

  return el(
    'div',
    { clase: 'portada' },
    el(
      'section',
      { clase: 'portada__presentacion' },
      el('h1', { clase: 'portada__titulo' }, t('portada.titulo')),
      el('p', { clase: 'portada__descripcion' }, t('portada.descripcion')),
      crearBuscador({
        desplegar,
        alEscribir: (valor) => {
          consulta = valor;
          pintarIndice();
        },
      }),
      el('div', { clase: 'portada__filtros' }, segmentadoPerfil.elemento, resultados),
    ),
    indice,
  );
}
