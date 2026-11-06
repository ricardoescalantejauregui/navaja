# AGENTS.md — Navaja

Guía para cualquier agente o persona que desarrolle este proyecto. Léela completa antes de cambiar código.

## Qué es

**Navaja** es una aplicación web en español con herramientas pequeñas para desarrollo y diseño: transformar, validar y generar datos, trabajar con color y tipografía, y preparar imágenes y assets.

Todo se procesa en el navegador. No hay cuentas, servidor ni base de datos, y ningún dato del usuario sale de su equipo. Esa promesa es el centro del producto: ningún cambio puede romperla.

- **Perfiles:** `dev` (desarrollo), `uxui` (diseño UX/UI) y `grafico` (diseño gráfico).
- **Alcance de la v1:** 68 herramientas gratuitas (38 de desarrollo y 30 de diseño), con búsqueda, categorías, filtro por perfil, favoritos, recientes, tema claro/oscuro y uso sin conexión (PWA).
- **Nombre:** la revisión de marca sigue pendiente, así que el nombre del producto se define en un solo lugar (`codigo/i18n/es.json`) y nunca se escribe a mano en la lógica ni en las vistas.

## Idioma (obligatorio)

**Se escribe en español:**

- Toda la documentación, especificaciones, historias, criterios BDD, comentarios y mensajes.
- Todos los nombres definidos por el proyecto: variables, funciones, métodos, clases, módulos, archivos, carpetas, clases CSS, variables CSS, tablas y columnas de base de datos, endpoints, rutas y propiedades de contratos.
- Los títulos de las pruebas y los comandos de `package.json` que define el proyecto.

**Se conserva el nombre original** cuando es oficial o la tecnología exige escribirlo literalmente:

- Lenguajes, frameworks, bibliotecas, APIs, protocolos, comandos y estándares: `JSON`, `Base64`, `JWT`, `fetch`, `localStorage`, `document.createElement`, `npm test`.
- Palabras reservadas y API del lenguaje: `const`, `async`, `describe`, `test`, `addEventListener`.
- Archivos que una herramienta espera con ese nombre: `package.json`, `index.html`, `AGENTS.md`, `LICENSE`, `sw.js`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `_headers`.
- Términos técnicos sin traducción establecida que forman parte del nombre de una función: `hash`, `token`, `slug`, `regex`, `cron`.
- El texto legal de `LICENSE`, que debe permanecer idéntico al oficial.

**Forma de los nombres:**

- `camelCase` en funciones y variables, `PascalCase` en clases, `kebab-case` en archivos, rutas y clases CSS.
- Identificadores solo con ASCII: `diseno`, `contrasenas`, `decodificacion`. Evita abreviar de forma que cambie el sentido: usa `anualidad` o `periodo` en lugar de escribir "año" sin eñe.
- Las palabras clave de Gherkin van en español: `Característica`, `Escenario`, `Dado`, `Cuando`, `Entonces`.

## Fuentes de verdad

1. `documentacion/requerimientos.md`: requerimientos, catálogo, escenarios BDD y metas medibles.
2. Este archivo: cómo se trabaja.
3. `documentacion/catalogo-funcionalidades.md`: resumen del catálogo y de la v2 de pago.

Si dos fuentes se contradicen, detente y pregunta. Un cambio en la arquitectura o en los requerimientos se actualiza primero en el documento y después en el código.

## Identidad visual

La interfaz debe ser original y reconocible como propia.

**Prohibido:**

- Copiar o redibujar iconos, ilustraciones, logotipos, capturas, nombres o textos de otros productos.
- Usar familias de iconos de sistema o glifos Unicode a modo de icono.
- La composición genérica de este tipo de herramientas: menú lateral de categorías, cuadrícula de tarjetas con icono en un cuadro, transparencias decorativas y acento azul de sistema.
- Elementos que evoquen una marca de navajas, como una cruz con escudo.

**La identidad propia:**

- **Pieza central:** el buscador con forma de navaja (cacha de nogal, remache de latón y hoja de acero). Es el único elemento atrevido; todo lo demás se mantiene sereno.
- **Materiales como color:** acero, nogal, latón y acero pavonado, definidos en `codigo/css/tokens.css`. No uses colores fuera de los tokens.
- **Tipografía:** Big Shoulders Display para títulos y Atkinson Hyperlegible Next para el resto, ambas servidas desde el propio dominio. Monoespaciada del sistema para código.
- **Iconos:** solo los de `codigo/nucleo/iconos.js`, dibujados para este proyecto en una retícula de 24, trazo de 1.5 y un remache relleno que los identifica como familia.
- **Organización:** herramientas agrupadas por lo que la persona quiere hacer, en filas de lectura. Sentence case, sin etiquetas en mayúsculas.
- **Movimiento:** solo responde a una acción, salvo el despliegue de la hoja al cargar el inicio. Siempre respeta `prefers-reduced-motion`.

## Arquitectura (obligatoria)

- **Monolito estático:** un repositorio, una aplicación y un despliegue, sin servidor.
- **Sin frameworks:** HTML5 semántico, CSS3 nativo y JavaScript vanilla con módulos ES.
- **Cero dependencias en ejecución:** el navegador solo usa APIs nativas y nunca carga recursos de un CDN.
- **Dependencias de desarrollo:** Node.js 20 o superior, `@playwright/test` y `@axe-core/playwright`. No agregues otras.
- **Build propio:** `guiones/construir.js` copia `codigo/` a `publicacion/` y genera una página por herramienta y el `sitemap.xml`. Sin bundler ni transpilador.
- **Carga diferida:** cada herramienta se carga con `import()` solo al abrirla.
- **Lógica separada de la vista:** `logica.js` contiene funciones puras sin DOM, y `vista.js` solo crea DOM y maneja eventos.
- **Excepción de librerías:** solo si una herramienta no puede hacerse con APIs nativas en un tiempo razonable. La librería se copia a `codigo/terceros/`, se audita, se registra en `documentacion/terceros.md` y se sirve desde el propio dominio. Licencias aceptadas: MIT, BSD, ISC o Apache-2.0, y OFL-1.1 solo para tipografías.

## Estructura

```
AGENTS.md
LICENSE
package.json
documentacion/
  requerimientos.md
  catalogo-funcionalidades.md
  terceros.md
codigo/
  index.html
  herramientas.manifiesto.json   # registro de herramientas
  manifest.webmanifest
  sw.js
  _headers
  nucleo/                        # aplicacion, enrutador, registro, almacenamiento, preferencias, tema, i18n, dom, atajos, errores, iconos
  componentes/                   # aviso, boton, buscador, cargador, dialogo, encabezado, fila-herramienta, indice, marco-herramienta, pagina, pie, portada, segmentado, zona-arrastre
  herramientas/<id>/
    meta.json                    # especificación (SDD)
    <id>.feature                 # comportamiento (BDD)
    logica.test.js               # pruebas (TDD)
    logica.js                    # funciones puras
    vista.js                     # interfaz
    adaptador.js                 # opcional: APIs del navegador, probado en E2E
    <id>.css                     # opcional: estilos BEM de la herramienta
  css/                           # reinicio, tokens, base, disposicion
  i18n/es.json
  tipografias/
  terceros/                      # solo por la excepción de librerías
  imagenes/
  recursos/
guiones/
  construir.js
  servir.js
pruebas/e2e/
  nucleo.spec.js
  herramientas/<id>.spec.js
  apoyo/
publicacion/                     # salida del build; no se versiona
```

Agregar una herramienta solo debe requerir su carpeta, su entrada en `herramientas.manifiesto.json` y sus textos en `i18n/es.json`. Si necesitas modificar el núcleo para agregar una, revisa el diseño.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run desarrollo` | Sirve `codigo/` en `http://localhost:5173` |
| `npm test` | Pruebas unitarias con cobertura (`node:test`) |
| `npm run pruebas:e2e` | Playwright contra `publicacion/` |
| `npm run construir` | Genera `publicacion/` |

## Proceso de trabajo: SDD → BDD → TDD

Toda herramienta o funcionalidad nueva sigue este orden. No se escribe código de producción antes del paso 4.

1. **SDD:** crea `meta.json` a partir de la fila del catálogo.
2. **BDD:** escribe `<id>.feature` en Gherkin en español (`# language: es`), con un escenario normal, uno de error y un caso límite.
3. **TDD:** escribe `logica.test.js`, ejecuta `npm test` y confirma que falla.
4. **Código mínimo:** implementa `logica.js` hasta que las pruebas pasen.
5. **Refactor** con las pruebas en verde.
6. **Vista:** implementa `vista.js` con los componentes compartidos.
7. **E2E:** escribe `pruebas/e2e/herramientas/<id>.spec.js`. Cada `test()` lleva el nombre exacto de su escenario e incluye la revisión con axe. No se usa Cucumber.
8. **Registro:** agrega la herramienta a `herramientas.manifiesto.json` y sus textos a `i18n/es.json`.

**Trazabilidad:** cada requerimiento tiene un id (`RF-…`, `RNF-…`, `DEV-…`, `DIS-…`) que debe aparecer en `meta.json`, en el título de `Característica` y en los `describe`.

**Errores:** `logica.js` lanza `ErrorHerramienta` (de `nucleo/errores.js`) con un `codigo` definido en `meta.json`, y la vista lo traduce con `i18n`. Nunca muestres un error genérico sin explicación.

**Pruebas de `logica.js`:** un `describe` por función exportada y al menos una prueba por criterio de aceptación. Sin acceso a `window`, `document` ni red: si hace falta una API del navegador, recíbela como parámetro o aíslala en `adaptador.js`.

## Reglas de código

- Solo `const` y `let`.
- Prohibido: `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` y `new Function`.
- Crea contenido con `document.createElement`, `textContent` y `appendChild`, o con el helper `nucleo/dom.js`.
- Prohibido: `alert`, `confirm` y `prompt`. Usa los componentes `aviso` y `dialogo`.
- Usa `event.preventDefault()` en todo `submit` y en los `click` sobre enlaces que no deben navegar.
- Ningún texto visible va fijo en `vista.js`: todos salen de `i18n/es.json`.
- Funciones cortas, nombres descriptivos y sin optimizaciones prematuras.
- Los procesos pesados (imágenes, archivos de más de 1 MB, diff de más de 5.000 líneas) van en un Web Worker.

## Reglas de estilos

- CSS3 nativo, sin preprocesadores.
- `html { font-size: 62.5%; }`, de modo que 1rem = 10px. Nunca fijes el tamaño base en `px`.
- Todas las medidas en `rem`, excepto los bordes de 1px.
- BEM estricto en español y un archivo CSS por bloque.
- Colores, tipografía, espaciado, radios, sombras y transiciones como variables en `css/tokens.css`.
- Responsive desde 360px, con objetivos táctiles de al menos 4.4rem.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme`.
- Iconos con `aria-hidden="true"`; los botones que solo tienen icono llevan `aria-label`.

## Privacidad y seguridad

- Ninguna petición de red lleva datos del usuario. No hay cookies ni analítica que lea contenido.
- Las herramientas sensibles (JWT, HMAC, contraseñas) nunca guardan su entrada.
- "Reportar un problema" nunca incluye los datos de entrada.
- Usa `crypto.getRandomValues` para todo valor aleatorio de seguridad, nunca `Math.random`.
- La CSP de RNF-04 no admite `unsafe-inline` ni `unsafe-eval`. No la relajes para resolver un problema.
- El contenido del usuario se trata siempre como no confiable, por ejemplo al previsualizar Markdown o SVG.

## Definición de terminado

- [ ] `meta.json` completo y coherente con el catálogo.
- [ ] `.feature` con escenario normal, de error y de caso límite.
- [ ] Cada criterio de aceptación tiene prueba, con cobertura de `logica.js` de al menos 90 %.
- [ ] E2E en verde en Chromium, Firefox y WebKit.
- [ ] axe sin violaciones y uso completo con teclado.
- [ ] Sin texto fijo en `vista.js`.
- [ ] Reglas de idioma, código y estilos cumplidas.
- [ ] Registrada en `herramientas.manifiesto.json` con descripción SEO y palabras clave.
- [ ] Sin peticiones de red con datos del usuario.

## Licencia

La v1 se publica bajo **AGPL-3.0-only** (archivo `LICENSE`). Titular: Ricardo Escalante Jauregui.

- `package.json` lleva `"license": "AGPL-3.0-only"`.
- Todo archivo nuevo de JavaScript o CSS empieza con la línea `SPDX-License-Identifier: AGPL-3.0-only`, como comentario.
- La aplicación debe ofrecer a sus usuarios el código fuente (sección 13 de la licencia): la página "Acerca de" enlaza al repositorio público y a la licencia.
- No aceptes contribuciones externas hasta que exista un acuerdo de contribución (CLA) que permita usar ese código en la v2 de pago.
- El código de la v2 que no derive de este repositorio va en un repositorio privado y separado.
- La licencia no cubre el nombre ni el logotipo de Navaja.

## Fuera de alcance en la v1

No implementes cuentas, backend, API, IA, pagos, anuncios ni un segundo idioma. La v2 de pago se especificará en `documentacion/requerimientos-v2.md`.

Solo deja el terreno preparado: `nucleo/almacenamiento.js` con la interfaz `obtener`, `guardar`, `quitar` y `vaciar`; un campo `plan` en el manifiesto (`"gratis"` por defecto); y espacio en el encabezado para un futuro botón de cuenta.

## Pendientes

| Tema | Estado |
| --- | --- |
| Acuerdo de contribución (CLA) | Falta redactarlo antes de aceptar contribuciones externas. |
| Marca y dominio | Nombre elegido: Navaja. Falta revisar el IMPI y comprar el dominio. |
| Comprobador de certificado | Solo valida el formato y el tamaño. Decidir si se agrega al catálogo y si debe mostrar los campos del certificado. |
| Herramientas migradas | Las 14 tienen `logica.js`, pruebas y `vista.js`, y una cobertura E2E común en `pruebas/e2e/nucleo.spec.js`. Les faltan `meta.json`, `.feature` y E2E propios. |
| Funciones del catálogo aún sin hacer | Verificar la firma JWT (DEV-16), MD5 (DEV-20), QR de WiFi y vCard (DEV-18) y vista de árbol JSON (DEV-01). |
| Núcleo de la v1 sin hacer | PWA (RF-17), recordar la última entrada (RF-14) y atajos distintos de Ctrl+K (RF-13). Web Worker para procesos pesados (RF-C7). |
| Firefox | Falta ejecutar las E2E en Firefox: el navegador de Playwright no pudo arrancar en el equipo de desarrollo. |
| Mercado principal (PA-05) | Sin decidir; el catálogo ya supone México por el RFC y la CURP. |
