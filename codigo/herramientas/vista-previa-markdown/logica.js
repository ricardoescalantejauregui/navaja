// SPDX-License-Identifier: AGPL-3.0-only
// Convierte Markdown en un árbol cerrado de nodos. El HTML del usuario se trata siempre como texto.
const PROTOCOLO_SEGURO = /^(https?:|mailto:)/i;

const PATRONES_EN_LINEA = [
  { tipo: 'codigo', patron: /`([^`]+)`/ },
  { tipo: 'negrita', patron: /\*\*(.+?)\*\*/ },
  { tipo: 'cursiva', patron: /\*([^*\s][^*]*?)\*/ },
  { tipo: 'enlace', patron: /\[([^\]]+)\]\(([^)\s]+)\)/ },
];

export function analizarEnLinea(texto) {
  const candidatos = PATRONES_EN_LINEA.map(({ tipo, patron }) => ({ tipo, coincidencia: texto.match(patron) }))
    .filter(({ coincidencia }) => coincidencia)
    .sort((a, b) => a.coincidencia.index - b.coincidencia.index);

  if (candidatos.length === 0) return texto === '' ? [] : [{ tipo: 'texto', valor: texto }];

  const { tipo, coincidencia } = candidatos[0];
  const antes = texto.slice(0, coincidencia.index);
  const despues = texto.slice(coincidencia.index + coincidencia[0].length);
  return [...analizarEnLinea(antes), crearNodoEnLinea(tipo, coincidencia), ...analizarEnLinea(despues)];
}

function crearNodoEnLinea(tipo, coincidencia) {
  if (tipo === 'codigo') return { tipo, valor: coincidencia[1] };
  if (tipo === 'enlace') {
    if (!PROTOCOLO_SEGURO.test(coincidencia[2])) return { tipo: 'texto', valor: coincidencia[1] };
    return { tipo, url: coincidencia[2], hijos: analizarEnLinea(coincidencia[1]) };
  }
  return { tipo, hijos: analizarEnLinea(coincidencia[1]) };
}

export function analizarMarkdown(texto) {
  const lineas = texto.replace(/\r\n?/g, '\n').split('\n');
  const bloques = [];
  let indice = 0;

  while (indice < lineas.length) {
    const linea = lineas[indice];

    if (linea.trim() === '') {
      indice += 1;
    } else if (linea.startsWith('```')) {
      const contenido = [];
      indice += 1;
      while (indice < lineas.length && !lineas[indice].startsWith('```')) {
        contenido.push(lineas[indice]);
        indice += 1;
      }
      indice += 1;
      bloques.push({ tipo: 'bloqueCodigo', valor: contenido.join('\n') });
    } else if (/^#{1,6}\s/.test(linea)) {
      const [, marcas, titulo] = linea.match(/^(#{1,6})\s+(.*)$/);
      bloques.push({ tipo: 'titulo', nivel: marcas.length, hijos: analizarEnLinea(titulo.trim()) });
      indice += 1;
    } else if (/^>\s?/.test(linea)) {
      const contenido = [];
      while (indice < lineas.length && /^>\s?/.test(lineas[indice])) {
        contenido.push(lineas[indice].replace(/^>\s?/, ''));
        indice += 1;
      }
      bloques.push({ tipo: 'cita', hijos: analizarEnLinea(contenido.join(' ')) });
    } else if (/^(\s*[-*+]\s|\s*\d+\.\s)/.test(linea)) {
      const ordenada = /^\s*\d+\.\s/.test(linea);
      const patron = ordenada ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/;
      const elementos = [];
      while (indice < lineas.length && patron.test(lineas[indice])) {
        elementos.push(analizarEnLinea(lineas[indice].replace(patron, '')));
        indice += 1;
      }
      bloques.push({ tipo: 'lista', ordenada, elementos });
    } else {
      const contenido = [];
      while (indice < lineas.length && lineas[indice].trim() !== '' && !/^(#{1,6}\s|```|>\s?|\s*[-*+]\s|\s*\d+\.\s)/.test(lineas[indice])) {
        contenido.push(lineas[indice].trim());
        indice += 1;
      }
      bloques.push({ tipo: 'parrafo', hijos: analizarEnLinea(contenido.join(' ')) });
    }
  }
  return bloques;
}

function escaparHtml(texto) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const ETIQUETA_EN_LINEA = { negrita: 'strong', cursiva: 'em' };

function enLineaAHtml(nodos) {
  return nodos
    .map((nodo) => {
      if (nodo.tipo === 'texto') return escaparHtml(nodo.valor);
      if (nodo.tipo === 'codigo') return `<code>${escaparHtml(nodo.valor)}</code>`;
      if (nodo.tipo === 'enlace') return `<a href="${escaparHtml(nodo.url)}">${enLineaAHtml(nodo.hijos)}</a>`;
      const etiqueta = ETIQUETA_EN_LINEA[nodo.tipo];
      return `<${etiqueta}>${enLineaAHtml(nodo.hijos)}</${etiqueta}>`;
    })
    .join('');
}

export function bloquesAHtml(bloques) {
  return bloques
    .map((bloque) => {
      if (bloque.tipo === 'titulo') return `<h${bloque.nivel}>${enLineaAHtml(bloque.hijos)}</h${bloque.nivel}>`;
      if (bloque.tipo === 'parrafo') return `<p>${enLineaAHtml(bloque.hijos)}</p>`;
      if (bloque.tipo === 'cita') return `<blockquote>${enLineaAHtml(bloque.hijos)}</blockquote>`;
      if (bloque.tipo === 'bloqueCodigo') return `<pre><code>${escaparHtml(bloque.valor)}</code></pre>`;
      const etiqueta = bloque.ordenada ? 'ol' : 'ul';
      const elementos = bloque.elementos.map((elemento) => `  <li>${enLineaAHtml(elemento)}</li>`).join('\n');
      return `<${etiqueta}>\n${elementos}\n</${etiqueta}>`;
    })
    .join('\n');
}
