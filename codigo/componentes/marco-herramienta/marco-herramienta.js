// SPDX-License-Identifier: AGPL-3.0-only
// Pantalla común a todas las herramientas: encabezado, opciones, entrada, resultado y ayuda.
import { descargarBlob, el, formatearTamano } from '../../nucleo/dom.js';
import { ErrorHerramienta } from '../../nucleo/errores.js';
import { t, tValor } from '../../nucleo/i18n.js';
import { crearIcono } from '../../nucleo/iconos.js';
import { alternarFavorito, esFavorito } from '../../nucleo/preferencias.js';
import { mostrarAviso } from '../aviso/aviso.js';
import { mostrarCargador, ocultarCargador } from '../cargador/cargador.js';
import { crearSegmentado } from '../segmentado/segmentado.js';

const ESPERA_ESCRITURA = 150;
const LIMITE_ARCHIVO = 10 * 1024 * 1024;
const ID_CAMPO = 'marco-entrada';
const ID_ERROR = 'marco-error';

function crearBoton(icono, texto, alPulsar, clase = '') {
  return el(
    'button',
    { clase: `boton ${clase}`.trim(), type: 'button', eventos: { click: alPulsar } },
    crearIcono(icono),
    texto,
  );
}

function crearFavorito(id) {
  const boton = el('button', { clase: 'boton', type: 'button' });
  function pintar(marcada) {
    boton.replaceChildren(
      crearIcono('estrella', marcada ? 'icono--relleno' : ''),
      t(marcada ? 'favoritos.quitar' : 'favoritos.agregar'),
    );
  }
  boton.addEventListener('click', () => pintar(alternarFavorito(id)));
  pintar(esFavorito(id));
  return boton;
}

// Resultado de texto: el caso más común. Las herramientas pueden aportar otro con la misma interfaz.
export function crearSalidaTexto({ archivo } = {}) {
  const salida = el('textarea', {
    clase: 'marco-herramienta__salida',
    readonly: true,
    spellcheck: 'false',
    placeholder: t('marco.resultadoVacio'),
    'aria-label': t('marco.resultado'),
  });
  const nota = el('p', { clase: 'marco-herramienta__nota', hidden: true });
  return {
    elemento: [salida, nota],
    // Acepta un texto o un objeto { texto, nota } con una aclaración bajo el resultado.
    mostrar: (resultado) => {
      const { texto, nota: aclaracion } = typeof resultado === 'string' ? { texto: resultado } : resultado;
      salida.value = texto;
      nota.textContent = aclaracion ?? '';
      nota.hidden = !aclaracion;
    },
    limpiar: () => {
      salida.value = '';
      nota.textContent = '';
      nota.hidden = true;
    },
    textoACopiar: () => salida.value,
    descargas: archivo
      ? [
          {
            etiqueta: t('marco.descargar'),
            obtener: () => ({
              blob: new Blob([salida.value], { type: archivo.tipo }),
              nombre: archivo.nombre,
            }),
          },
        ]
      : [],
  };
}

export function crearMarco({ id, opciones = [], entrada = {}, salida = crearSalidaTexto(), procesar }) {
  const prefijo = `herramientas.${id}`;
  const valores = Object.fromEntries(opciones.map((opcion) => [opcion.nombre, opcion.inicial ?? opcion.valores[0]]));
  let archivoActual = null;
  let temporizador;
  let turno = 0;

  const error = el('p', { clase: 'marco-herramienta__error', id: ID_ERROR, role: 'alert', hidden: true });
  const cuerpoEntrada = el('div', { clase: 'marco-herramienta__cuerpo' });
  const accionesEntrada = el('div', { clase: 'marco-herramienta__acciones' });

  const tipoEntrada = () => (typeof entrada.tipo === 'function' ? entrada.tipo(valores) : entrada.tipo ?? 'texto');

  const campo = el('textarea', {
    clase: 'marco-herramienta__campo',
    id: ID_CAMPO,
    spellcheck: 'false',
    autocomplete: 'off',
    'aria-describedby': ID_ERROR,
    eventos: {
      input: () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(ejecutar, ESPERA_ESCRITURA);
      },
    },
  });

  const selectorArchivo = el('input', {
    type: 'file',
    hidden: true,
    accept: entrada.aceptar ?? null,
    eventos: {
      change: (evento) => {
        const [archivo] = evento.target.files;
        if (archivo) recibirArchivo(archivo);
        evento.target.value = '';
      },
    },
  });

  function mostrarError(texto) {
    const hijos = [crearIcono('alerta'), el('span', {}, texto)];
    error.replaceChildren(...hijos);
    error.hidden = false;
    campo.setAttribute('aria-invalid', 'true');
  }

  function limpiarError() {
    error.hidden = true;
    error.replaceChildren();
    campo.removeAttribute('aria-invalid');
  }

  function vaciarResultado() {
    salida.limpiar();
    actualizarAccionesResultado(false);
  }

  async function ejecutar() {
    const miTurno = ++turno;
    const texto = campo.value;
    const usaArchivo = tipoEntrada() === 'archivo';
    const hayArchivo = archivoActual !== null;
    const hayEntrada = usaArchivo ? hayArchivo : (hayArchivo && entrada.archivoOpcional) || texto !== '';

    limpiarError();
    if (!hayEntrada) {
      vaciarResultado();
      return;
    }

    mostrarCargador();
    try {
      const resultado = await procesar({
        texto: usaArchivo ? '' : texto,
        archivo: archivoActual,
        opciones: { ...valores },
      });
      if (miTurno !== turno) return;
      salida.mostrar(resultado);
      actualizarAccionesResultado(true);
    } catch (fallo) {
      if (miTurno !== turno) return;
      vaciarResultado();
      if (!(fallo instanceof ErrorHerramienta)) throw fallo;
      mostrarError(t(`${prefijo}.errores.${fallo.codigo}`, fallo.datos));
    } finally {
      ocultarCargador();
    }
  }

  function recibirArchivo(archivo) {
    if (archivo.size > LIMITE_ARCHIVO) {
      mostrarError(t('marco.archivoGrande'));
      return;
    }
    if (entrada.soloImagenes && !archivo.type.startsWith('image/')) {
      mostrarError(t('marco.soloImagenes'));
      return;
    }
    archivoActual = archivo;
    if (entrada.archivoComoTexto) {
      archivoActual = null;
      archivo.text().then((texto) => {
        campo.value = texto;
        ejecutar();
      });
      return;
    }
    pintarEntrada();
    ejecutar();
  }

  function quitarArchivo() {
    archivoActual = null;
    pintarEntrada();
    ejecutar();
  }

  function crearZonaArchivo() {
    const contenido = archivoActual
      ? [
          el(
            'p',
            { clase: 'zona-arrastre__nombre' },
            t('marco.archivoCargado', { nombre: archivoActual.name, tamano: formatearTamano(archivoActual.size) }),
          ),
          crearBoton('limpiar', t('marco.quitarArchivo'), quitarArchivo),
        ]
      : [
          crearIcono('archivo'),
          el('p', {}, t('marco.arrastrar')),
          crearBoton('archivo', t('marco.elegirArchivo'), () => selectorArchivo.click()),
        ];
    return el('div', { clase: 'zona-arrastre' }, contenido);
  }

  function pintarEntrada() {
    const usaArchivo = tipoEntrada() === 'archivo';
    const mostrarZona = usaArchivo || (entrada.archivoOpcional && archivoActual);
    cuerpoEntrada.replaceChildren(
      error,
      mostrarZona ? crearZonaArchivo() : campo,
      selectorArchivo,
    );

    const acciones = [];
    if (!mostrarZona) {
      acciones.push(crearBoton('pegar', t('marco.pegar'), pegar));
      if (tValor(`${prefijo}.ejemplo`) !== undefined || entrada.crearEjemplo) {
        acciones.push(crearBoton('ejemplo', t('marco.ejemplo'), cargarEjemplo));
      }
      if (entrada.archivoComoTexto || entrada.archivoOpcional) {
        acciones.push(crearBoton('archivo', t('marco.abrirArchivo'), () => selectorArchivo.click()));
      }
      acciones.push(crearBoton('limpiar', t('marco.limpiar'), limpiar));
    }
    accionesEntrada.replaceChildren(...acciones);
  }

  async function pegar() {
    try {
      campo.value = await navigator.clipboard.readText();
      campo.focus();
      ejecutar();
    } catch {
      mostrarAviso(t('marco.errorPegar'), { error: true });
    }
  }

  function cargarEjemplo() {
    campo.value = entrada.crearEjemplo ? entrada.crearEjemplo() : t(`${prefijo}.ejemplo`);
    ejecutar();
  }

  function limpiar() {
    campo.value = '';
    archivoActual = null;
    limpiarError();
    vaciarResultado();
    campo.focus();
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(salida.textoACopiar());
      mostrarAviso(t('marco.copiado'));
    } catch {
      mostrarAviso(t('marco.errorCopiar'), { error: true });
    }
  }

  const botonCopiar = salida.textoACopiar
    ? crearBoton('copiar', t('marco.copiar'), copiar, 'boton--sobre-resultado')
    : null;
  const botonesDescarga = (salida.descargas ?? []).map((descarga) =>
    crearBoton(
      'descargar',
      descarga.etiqueta,
      async () => {
        const { blob, nombre } = await descarga.obtener();
        descargarBlob(blob, nombre);
        mostrarAviso(t('marco.descargado'));
      },
      'boton--sobre-resultado',
    ),
  );

  function actualizarAccionesResultado(disponible) {
    for (const boton of [botonCopiar, ...botonesDescarga]) {
      if (boton) boton.disabled = !disponible;
    }
  }

  const controlesOpciones = opciones.map((opcion) => {
    const control = crearSegmentado({
      nombre: opcion.nombre,
      leyenda: t(`${prefijo}.opciones.${opcion.nombre}.etiqueta`),
      valores: opcion.valores,
      etiqueta: (valor) => t(`${prefijo}.opciones.${opcion.nombre}.${valor}`),
      inicial: valores[opcion.nombre],
      alCambiar: (valor) => {
        valores[opcion.nombre] = valor;
        actualizarVisibilidadOpciones();
        pintarEntrada();
        ejecutar();
      },
    });
    return { opcion, control };
  });

  function actualizarVisibilidadOpciones() {
    for (const { opcion, control } of controlesOpciones) {
      if (opcion.visibleSi) control.elemento.hidden = !opcion.visibleSi(valores);
    }
  }

  // Arrastrar y soltar sobre todo el panel de entrada.
  function activarArrastre(panel) {
    const alternar = (activa) => panel.querySelector('.zona-arrastre')?.classList.toggle('zona-arrastre--activa', activa);
    panel.addEventListener('dragover', (evento) => {
      evento.preventDefault();
      alternar(true);
    });
    panel.addEventListener('dragleave', () => alternar(false));
    panel.addEventListener('drop', (evento) => {
      evento.preventDefault();
      alternar(false);
      const [archivo] = evento.dataTransfer.files;
      if (archivo) recibirArchivo(archivo);
    });
  }

  const panelEntrada = el(
    'section',
    { clase: 'marco-herramienta__panel marco-herramienta__panel--entrada', 'aria-label': t('marco.entrada') },
    el(
      'div',
      { clase: 'marco-herramienta__barra' },
      el('label', { clase: 'marco-herramienta__rotulo', for: ID_CAMPO }, t(`${prefijo}.etiquetaEntrada`) === `${prefijo}.etiquetaEntrada` ? t('marco.entrada') : t(`${prefijo}.etiquetaEntrada`)),
      accionesEntrada,
    ),
    cuerpoEntrada,
  );
  activarArrastre(panelEntrada);

  const panelResultado = el(
    'section',
    { clase: 'marco-herramienta__panel marco-herramienta__panel--resultado', 'aria-label': t('marco.resultado') },
    el(
      'div',
      { clase: 'marco-herramienta__barra' },
      el('h2', { clase: 'marco-herramienta__rotulo' }, t('marco.resultado')),
      el('div', { clase: 'marco-herramienta__acciones' }, botonCopiar, botonesDescarga),
    ),
    el('div', { clase: 'marco-herramienta__cuerpo' }, salida.elemento),
  );

  actualizarAccionesResultado(false);
  actualizarVisibilidadOpciones();
  pintarEntrada();

  return el(
    'article',
    { clase: 'marco-herramienta' },
    el(
      'a',
      { clase: 'marco-herramienta__volver', href: '/' },
      crearIcono('volver'),
      t('marco.volver'),
    ),
    el(
      'div',
      { clase: 'marco-herramienta__titular' },
      el('h1', { clase: 'marco-herramienta__titulo' }, t(`${prefijo}.nombre`)),
      crearFavorito(id),
    ),
    el('p', { clase: 'marco-herramienta__descripcion' }, t(`${prefijo}.descripcion`)),
    controlesOpciones.length > 0 &&
      el('div', { clase: 'marco-herramienta__opciones' }, controlesOpciones.map(({ control }) => control.elemento)),
    el('div', { clase: 'marco-herramienta__banco' }, panelEntrada, panelResultado),
    el(
      'section',
      { clase: 'marco-herramienta__uso' },
      el('h2', { clase: 'marco-herramienta__uso-titulo' }, t('marco.comoSeUsa')),
      tValor(`${prefijo}.uso`).map((frase) => el('p', { clase: 'marco-herramienta__uso-texto' }, frase)),
    ),
  );
}
