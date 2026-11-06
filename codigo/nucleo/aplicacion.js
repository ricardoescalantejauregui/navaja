// SPDX-License-Identifier: AGPL-3.0-only
import { cargarTextos, t } from './i18n.js';
import { cargarManifiesto, obtenerHerramienta } from './registro.js';
import { obtenerFavoritos, obtenerRecientes, registrarReciente } from './preferencias.js';
import { vaciar } from './almacenamiento.js';
import { aplicarTema } from './tema.js';
import { crearEnrutador } from './enrutador.js';
import { registrarAtajos } from './atajos.js';
import { crearEncabezado } from '../componentes/encabezado/encabezado.js';
import { crearPie } from '../componentes/pie/pie.js';
import { crearPortada, enfocarBuscador } from '../componentes/portada/portada.js';
import { crearListaPersonal, crearPaginaInformativa, crearPaginaNoEncontrada } from '../componentes/pagina/pagina.js';
import { iniciarAvisos, mostrarAviso } from '../componentes/aviso/aviso.js';
import { pedirConfirmacion } from '../componentes/dialogo/dialogo.js';
import { iniciarCargador, ocultarCargador, mostrarCargador } from '../componentes/cargador/cargador.js';

const contenido = document.querySelector('#contenido');
let ultimaHerramienta = null;
let primeraPintura = true;

function pintar(hijo, titulo) {
  contenido.replaceChildren(hijo);
  document.title = titulo;
}

function enfocarTitulo() {
  const titulo = contenido.querySelector('h1');
  if (!titulo) return;
  titulo.tabIndex = -1;
  titulo.focus({ preventScroll: true });
}

async function abrirHerramienta(id) {
  const herramienta = obtenerHerramienta(id);
  mostrarCargador();
  try {
    const { crearVista } = await import(`../herramientas/${id}/vista.js`);
    pintar(crearVista(herramienta), `${t(`herramientas.${id}.nombre`)} | ${t('aplicacion.nombre')}`);
    registrarReciente(id);
    ultimaHerramienta = id;
  } finally {
    ocultarCargador();
  }
}

function abrirPortada({ desdeHistorial }) {
  const marca = t('aplicacion.nombre');
  pintar(crearPortada({ desplegar: primeraPintura }), `${marca}: ${t('aplicacion.lema')}`);
  if (desdeHistorial && ultimaHerramienta) {
    contenido.querySelector(`a[href="/${ultimaHerramienta}/"]`)?.focus();
  }
}

function abrirLista(clave, ids) {
  pintar(crearListaPersonal(clave, ids), `${t(`paginas.${clave}.titulo`)} | ${t('aplicacion.nombre')}`);
}

async function alCambiarRuta(ruta, { desdeHistorial, inicial = false }) {
  const id = ruta.replaceAll('/', '');
  const esPortada = id === '';

  if (esPortada) {
    abrirPortada({ desdeHistorial: desdeHistorial && !inicial });
  } else if (obtenerHerramienta(id)) {
    await abrirHerramienta(id);
  } else if (id === 'favoritos') {
    abrirLista('favoritos', obtenerFavoritos());
  } else if (id === 'recientes') {
    abrirLista('recientes', obtenerRecientes());
  } else if (id === 'acerca-de' || id === 'privacidad') {
    pintar(crearPaginaInformativa(id), `${t(`paginas.${id}.titulo`)} | ${t('aplicacion.nombre')}`);
  } else {
    pintar(crearPaginaNoEncontrada(), `${t('paginas.noEncontrada.titulo')} | ${t('aplicacion.nombre')}`);
  }

  actualizarEncabezado(esPortada, ruta);
  if (!inicial && !(esPortada && desdeHistorial)) {
    window.scrollTo(0, 0);
    if (!esPortada) enfocarTitulo();
  }
  primeraPintura = false;
}

let actualizarEncabezado = () => {};

async function borrarDatos(origen) {
  const confirmado = await pedirConfirmacion({
    origen,
    titulo: t('dialogo.borrarTitulo'),
    texto: t('dialogo.borrarTexto'),
    confirmar: t('dialogo.borrar'),
    cancelar: t('dialogo.cancelar'),
  });
  if (!confirmado) return;
  vaciar();
  aplicarTema('sistema');
  mostrarAviso(t('dialogo.borrado'));
  enrutador.navegar(location.pathname);
}

let enrutador;

async function iniciar() {
  await Promise.all([cargarTextos(), cargarManifiesto()]);
  iniciarAvisos(document.querySelector('#avisos'));
  iniciarCargador(document.querySelector('#cargador'));

  const encabezado = crearEncabezado();
  document.querySelector('#encabezado').replaceWith(encabezado.elemento);
  actualizarEncabezado = encabezado.actualizar;
  document.querySelector('#pie').replaceWith(crearPie({ alBorrar: borrarDatos }));

  enrutador = crearEnrutador(alCambiarRuta);
  registrarAtajos({
    alBuscar: async () => {
      if (location.pathname !== '/') enrutador.navegar('/');
      enfocarBuscador();
    },
  });
  enrutador.iniciar();
}

iniciar();
