// SPDX-License-Identifier: AGPL-3.0-only
import { crearMarco } from '../../componentes/marco-herramienta/marco-herramienta.js';
import { el } from '../../nucleo/dom.js';
import { t } from '../../nucleo/i18n.js';
import { analizarMarkdown, bloquesAHtml } from './logica.js';

const ETIQUETAS = { negrita: 'strong', cursiva: 'em' };

function crearEnLinea(nodos) {
  return nodos.map((nodo) => {
    if (nodo.tipo === 'texto') return nodo.valor;
    if (nodo.tipo === 'codigo') return el('code', {}, nodo.valor);
    if (nodo.tipo === 'enlace') return el('a', { href: nodo.url, rel: 'noopener noreferrer' }, crearEnLinea(nodo.hijos));
    return el(ETIQUETAS[nodo.tipo], {}, crearEnLinea(nodo.hijos));
  });
}

// El documento vive bajo el h2 «Resultado», así que sus títulos bajan dos niveles.
function crearTitulo({ nivel, hijos }) {
  const clase = nivel === 1 ? 'documento__titulo documento__titulo--mayor' : 'documento__titulo';
  return el(`h${Math.min(nivel + 2, 6)}`, { clase }, crearEnLinea(hijos));
}

function crearBloque(bloque) {
  if (bloque.tipo === 'titulo') return crearTitulo(bloque);
  if (bloque.tipo === 'parrafo') return el('p', {}, crearEnLinea(bloque.hijos));
  if (bloque.tipo === 'cita') return el('blockquote', {}, crearEnLinea(bloque.hijos));
  if (bloque.tipo === 'bloqueCodigo') return el('pre', {}, el('code', {}, bloque.valor));
  return el(
    bloque.ordenada ? 'ol' : 'ul',
    {},
    bloque.elementos.map((elemento) => el('li', {}, crearEnLinea(elemento))),
  );
}

function crearSalidaMarkdown() {
  const lienzo = el('div', { clase: 'marco-herramienta__lienzo documento', tabindex: '0', 'aria-label': t('marco.resultado') });
  const codigo = el('textarea', { clase: 'marco-herramienta__salida', readonly: true, hidden: true, 'aria-label': t('marco.resultado') });
  const vacio = () => el('p', { clase: 'marco-herramienta__vacio' }, t('marco.resultadoVacio'));
  lienzo.append(vacio());

  return {
    elemento: [lienzo, codigo],
    mostrar: ({ bloques, html, comoHtml }) => {
      lienzo.replaceChildren(...bloques.map(crearBloque));
      codigo.value = html;
      lienzo.hidden = comoHtml;
      codigo.hidden = !comoHtml;
    },
    limpiar: () => {
      lienzo.replaceChildren(vacio());
      codigo.value = '';
      lienzo.hidden = false;
      codigo.hidden = true;
    },
    textoACopiar: () => codigo.value,
    descargas: [
      {
        etiqueta: t('marco.descargar'),
        obtener: () => ({ blob: new Blob([codigo.value], { type: 'text/html' }), nombre: 'documento.html' }),
      },
    ],
  };
}

export function crearVista() {
  return crearMarco({
    id: 'vista-previa-markdown',
    entrada: { archivoComoTexto: true },
    opciones: [{ nombre: 'vista', valores: ['previa', 'html'] }],
    salida: crearSalidaMarkdown(),
    procesar: ({ texto, opciones }) => {
      const bloques = analizarMarkdown(texto);
      return { bloques, html: bloquesAHtml(bloques), comoHtml: opciones.vista === 'html' };
    },
  });
}
