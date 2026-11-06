# Navaja — Especificación de requerimientos v1

| Campo | Valor |
| --- | --- |
| Versión del documento | 1.0 |
| Fecha | 2026-11-02 |
| Alcance | Versión 1 (gratuita, sin servidor) |
| Metodología | SDD (especificación primero) → BDD (comportamiento) → TDD (pruebas primero) |
| Documento base | `AGENTS.md` |
| Ubicación en el repo | `documentacion/requerimientos.md` |

---

## 1. Propósito y alcance

Navaja es una aplicación web en español con utilidades para tres perfiles:

- **Desarrolladores** (`dev`): transformar, validar y generar datos.
- **Diseñadores UX/UI** (`uxui`): color, tipografía, layout y accesibilidad.
- **Diseñadores gráficos** (`grafico`): preparar, convertir y optimizar imágenes y assets.

### 1.1 Dentro del alcance de la v1

- 68 herramientas (38 de desarrollo y 30 de diseño), listadas en la sección 6.
- Listado general, búsqueda, categorías, filtro por perfil, favoritos y recientes.
- Una pantalla y una URL propias por herramienta.
- Tema claro, oscuro y del sistema.
- Funcionamiento sin conexión (PWA).
- Todo el procesamiento en el navegador del usuario.

### 1.2 Fuera del alcance de la v1

- Cuentas de usuario, inicio de sesión y sincronización.
- Cualquier backend, base de datos, API propia o de terceros.
- Inteligencia artificial.
- Pagos, planes o anuncios.
- Segundo idioma (los textos quedan preparados para traducirse, pero solo se publica español).

---

## 2. Restricciones técnicas (decisiones de arquitectura)

Estas restricciones son obligatorias. Un cambio en ellas requiere actualizar este documento antes del código.

| Id | Decisión | Detalle |
| --- | --- | --- |
| ADR-01 | **Monolito estático** | Un solo repositorio, una sola aplicación, un solo despliegue. No hay microservicios ni servidor. |
| ADR-02 | **Sin frameworks** | HTML5 semántico, CSS3 nativo y JavaScript vanilla con módulos ES (`<script type="module">`). |
| ADR-03 | **Cero dependencias en ejecución** | El navegador del usuario no descarga ninguna librería de terceros. Solo APIs nativas. |
| ADR-04 | **Dependencias mínimas de desarrollo** | Requisito: Node.js 20 o superior. Únicas dependencias npm: `@playwright/test` y `@axe-core/playwright` (solo para pruebas E2E y accesibilidad). |
| ADR-05 | **Pruebas unitarias sin librerías** | `node:test` y `node:assert` (incluidos en Node). Cobertura con `node --test --experimental-test-coverage`. |
| ADR-06 | **Build mínimo propio** | Un script de Node sin dependencias (`guiones/construir.js`) que copia `codigo/` a `publicacion/` y genera una página HTML por herramienta y el `sitemap.xml`. Sin bundler ni transpilador. |
| ADR-07 | **Carga diferida** | Cada herramienta se carga con `import()` solo al abrirla. |
| ADR-08 | **Lógica separada de la vista** | `logica.js` contiene funciones puras sin DOM (se prueban con TDD). `vista.js` solo crea DOM y maneja eventos. |
| ADR-09 | **Hosting estático** | Cualquier hosting estático. Recomendado: Cloudflare Pages (gratuito y permite uso comercial). |
| ADR-10 | **Excepción de librerías** | Si una herramienta no puede hacerse con APIs nativas en un tiempo razonable, se puede copiar una librería pequeña a `codigo/terceros/`, con licencia compatible, auditada, registrada en `documentacion/terceros.md` y servida desde el propio dominio. Nunca desde CDN. |

### 2.1 Reglas de código (heredadas de AGENTS.md)

- Solo `const` y `let`; nunca `var`.
- Prohibido: `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`.
- Crear contenido con `document.createElement`, `textContent` y `appendChild`.
- Prohibido `alert`, `confirm` y `prompt`. Usar los componentes `aviso` y `dialogo` del proyecto, con los estilos del sitio.
- `event.preventDefault()` en todo `submit` y en los `click` sobre enlaces que no deben navegar.
- Código legible y sencillo: funciones cortas, nombres descriptivos, sin optimizaciones prematuras.

### 2.2 Reglas de estilos (heredadas de AGENTS.md)

- CSS3 nativo, sin preprocesadores.
- `html { font-size: 62.5%; }` → 1rem = 10px, respetando el tamaño de letra elegido por el usuario. Nunca fijar el tamaño base en `px`.
- Todas las medidas en `rem` (excepto bordes de 1px).
- Flexbox y CSS Grid según convenga.
- BEM estricto: `bloque`, `bloque__elemento`, `bloque--modificador`, `bloque__elemento--modificador`. Un archivo CSS por bloque.
- Colores tomados del diseño original (la sección "Identidad visual" de `AGENTS.md`), declarados como variables en `css/tokens.css`.
- Responsive desde 360px de ancho.

---

## 3. Estructura del proyecto

```
AGENTS.md
LICENSE
package.json                 # comandos: desarrollo, test, pruebas:e2e, construir
documentacion/
  requerimientos.md          # este documento
  catalogo-funcionalidades.md
  terceros.md                # librerías y tipografías de terceros
codigo/
  index.html                 # shell de la aplicación
  herramientas.manifiesto.json   # registro de herramientas
  manifest.webmanifest       # PWA
  sw.js                      # Service Worker
  _headers                   # cabeceras de seguridad del hosting
  nucleo/
    aplicacion.js            # arranque
    enrutador.js             # rutas /, /favoritos, /recientes, /<id>/
    registro.js              # lee el manifiesto, busca y filtra
    almacenamiento.js        # localStorage con prefijo "navaja:"
    tema.js                  # claro, oscuro, sistema
    i18n.js                  # carga es.json y expone t('clave')
    dom.js                   # helpers: el(etiqueta, atributos, ...hijos)
    atajos.js                # atajos de teclado
    errores.js               # ErrorHerramienta
    iconos.js                # iconos SVG propios
    preferencias.js          # favoritos, recientes y perfil
    tema-inicial.js          # aplica el tema antes de pintar
  componentes/
    aviso/                   # aviso.js + aviso.css
    boton/
    buscador/                # la navaja de la portada
    cargador/
    dialogo/
    encabezado/
    fila-herramienta/
    indice/
    marco-herramienta/       # encabezado, panel de entrada, panel de resultado
    pagina/
    pie/
    portada/
    segmentado/              # opciones excluyentes con radios nativos
    zona-arrastre/
  herramientas/
    <id>/
      meta.json              # especificación (SDD)
      <id>.feature           # comportamiento (BDD)
      logica.js              # funciones puras
      logica.test.js         # pruebas unitarias (TDD)
      vista.js               # interfaz
      adaptador.js           # opcional: APIs del navegador, probado en E2E
      <id>.css               # estilos BEM del bloque de la herramienta (si los necesita)
  css/
    reinicio.css
    tokens.css
    base.css
    disposicion.css
  i18n/
    es.json
  tipografias/
  terceros/                  # solo por la excepción de librerías (ADR-10)
  imagenes/
  recursos/
guiones/
  construir.js
  servir.js                  # servidor local sin dependencias (node:http)
pruebas/
  e2e/
    nucleo.spec.js
    herramientas/<id>.spec.js
    apoyo/                   # pasos BDD reutilizables
publicacion/                 # salida del build (no se versiona)
```

### 3.1 Comandos de `package.json`

| Comando | Qué hace |
| --- | --- |
| `npm run desarrollo` | Sirve `codigo/` en `http://localhost:5173` con `guiones/servir.js` |
| `npm test` | `node --test --experimental-test-coverage codigo/` |
| `npm run pruebas:e2e` | `playwright test` contra `publicacion/` |
| `npm run construir` | Genera `publicacion/` |

---

## 4. Proceso de trabajo obligatorio: SDD → BDD → TDD

Toda herramienta o funcionalidad nueva sigue estos pasos, en este orden. No se escribe código de producción antes de los pasos 1 a 3.

1. **SDD — Especificación.** Crear `herramientas/<id>/meta.json` con el esquema de la sección 4.1, a partir de la fila del catálogo (sección 6).
2. **BDD — Comportamiento.** Escribir `herramientas/<id>/<id>.feature` en Gherkin en español con al menos:
   - un escenario de uso normal,
   - un escenario de error de entrada,
   - un escenario de caso límite (vacío, muy grande o caracteres especiales).
3. **TDD — Prueba roja.** Escribir `logica.test.js` derivado de los escenarios. Ejecutar `npm test` y confirmar que falla.
4. **Código mínimo.** Implementar `logica.js` hasta que las pruebas pasen.
5. **Refactor** con las pruebas en verde.
6. **Vista.** Implementar `vista.js` usando los componentes compartidos.
7. **E2E.** Escribir `pruebas/e2e/herramientas/<id>.spec.js` que recorra los escenarios del `.feature`, incluida la revisión de accesibilidad con axe.
8. **Registro.** Agregar la herramienta a `herramientas.manifiesto.json` y sus textos a `i18n/es.json`.
9. **Definición de terminado** (sección 10) cumplida.

### 4.1 Esquema de `meta.json`

```json
{
  "id": "verificador-contraste",
  "nombre": "Verificador de contraste",
  "perfil": ["uxui"],
  "categoria": "color",
  "prioridad": "P0",
  "descripcionSeo": "Comprueba el contraste entre dos colores según WCAG 2.2 (AA y AAA) en tu navegador.",
  "palabrasClave": ["contraste", "wcag", "accesibilidad", "color"],
  "entradas": [
    { "nombre": "colorTexto", "tipo": "color", "requerido": true },
    { "nombre": "colorFondo", "tipo": "color", "requerido": true }
  ],
  "salidas": [
    { "nombre": "ratio", "tipo": "numero", "formato": "2 decimales" },
    { "nombre": "niveles", "tipo": "objeto", "descripcion": "AA/AAA para texto normal y grande" }
  ],
  "errores": [
    { "codigo": "COLOR_INVALIDO", "mensaje": "Color no válido" }
  ],
  "limites": { "tamanoMaximoEntrada": "n/a" },
  "criteriosAceptacion": [
    "Negro sobre blanco devuelve 21:1",
    "#777777 sobre blanco devuelve 4.48:1 y no cumple AA"
  ],
  "apisNativas": []
}
```

### 4.2 Convenciones BDD

- Cabecera `# language: es`; palabras clave `Característica`, `Antecedentes`, `Escenario`, `Esquema del escenario`, `Ejemplos`, `Dado`, `Cuando`, `Entonces`, `Y`, `Pero`.
- Los escenarios describen lo que ve el usuario, no la implementación.
- Los textos entre comillas deben coincidir exactamente con `i18n/es.json`.
- Los `.feature` se ejecutan manualmente traducidos a pruebas de Playwright (sin Cucumber, para no agregar dependencias). Cada `test()` lleva como título el nombre exacto del escenario, para mantener la trazabilidad.

### 4.3 Convenciones TDD

- Un `describe` por función exportada de `logica.js`.
- Cada criterio de aceptación de `meta.json` tiene al menos una prueba.
- Las funciones de `logica.js` lanzan `ErrorHerramienta` (de `nucleo/errores.js`) con el `codigo` definido en `meta.json`; la vista traduce el código a mensaje con `i18n`.
- Sin acceso a `window`, `document` ni red en `logica.js`. Si necesita una API del navegador (Canvas, Web Crypto), se recibe como parámetro o se aísla en `adaptador.js` probado en E2E.

### 4.4 Trazabilidad

Cada requerimiento tiene un id (`RF-…`, `RNF-…`, `DEV-…`, `DIS-…`). Ese id aparece:

- en `meta.json` (campo `id` o `requerimientos`),
- en el título de `Característica` del `.feature` (`Característica: DIS-02 Verificador de contraste`),
- en el `describe` de las pruebas.

---

## 5. Requerimientos funcionales del núcleo

| Id | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-01 | La página de inicio muestra las herramientas como filas con icono, nombre y descripción corta, agrupadas por categoría. | P0 |
| RF-02 | Un buscador filtra herramientas por nombre, palabras clave y descripción, sin distinguir mayúsculas ni acentos, mientras se escribe. | P0 |
| RF-03 | Filtro por perfil: Todos, Desarrollo, UX/UI, Diseño gráfico. Se recuerda la última elección. | P0 |
| RF-04 | Las categorías se muestran como títulos de grupo en el listado, sin menú lateral (ver "Identidad visual" en `AGENTS.md`). | P0 |
| RF-05 | Cada herramienta tiene URL propia `/<id>/`. Abrirla sustituye el listado por la pantalla de la herramienta; "Atrás" del navegador vuelve al listado. | P0 |
| RF-06 | Indicador de carga visible mientras se descarga el módulo de una herramienta o se procesa una tarea de más de 300 ms. | P0 |
| RF-07 | Favoritos: marcar o desmarcar desde la fila y desde la herramienta. Página "Favoritos" enlazada desde el encabezado. | P0 |
| RF-08 | Recientes: las últimas 10 herramientas abiertas, de la más nueva a la más antigua. | P0 |
| RF-09 | Tema claro, oscuro o "del sistema", con cambio inmediato y recordado. | P0 |
| RF-10 | Componente `aviso` para confirmaciones ("Copiado al portapapeles") y errores generales. Se cierra solo a los 4 s o con un botón, y se anuncia a lectores de pantalla (`role="status"`). | P0 |
| RF-11 | Componente `dialogo` accesible (foco atrapado, `Esc` cierra, foco regresa al disparador) para confirmaciones. | P0 |
| RF-12 | Opción "Borrar mis datos" que elimina favoritos, recientes, tema y valores guardados, previa confirmación en `dialogo`. | P0 |
| RF-13 | Atajos: `Ctrl+K` / `Cmd+K` enfoca el buscador; `Ctrl+Enter` ejecuta la herramienta; `Ctrl+Shift+C` copia el resultado; `?` muestra la ayuda de atajos. | P1 |
| RF-14 | Cada herramienta recuerda su última entrada en `localStorage` (excepto herramientas marcadas como sensibles: JWT, HMAC, contraseñas). | P1 |
| RF-15 | Página 404 con buscador y enlace al inicio. | P0 |
| RF-16 | Página "Acerca de" y "Privacidad" que explican que ningún dato sale del navegador. | P0 |
| RF-17 | Instalable como PWA; las herramientas ya visitadas funcionan sin conexión, y un aviso indica cuándo hay nueva versión. | P1 |
| RF-18 | Botón "Reportar un problema" que abre un issue de GitHub prellenado con el nombre de la herramienta y el navegador (nunca con los datos de entrada). | P2 |

### 5.1 Comportamiento común de toda pantalla de herramienta

Todas las herramientas usan el componente `marco-herramienta`, que ofrece:

| Id | Comportamiento |
| --- | --- |
| RF-C1 | Encabezado con nombre, descripción, botón favorito y enlace "Volver a herramientas". |
| RF-C2 | Panel de entrada con botones Pegar, Cargar ejemplo, Cargar archivo y Limpiar. Acepta arrastrar y soltar archivos cuando la herramienta lo admite. |
| RF-C3 | Panel de salida con botones Copiar y Descargar. |
| RF-C4 | Resultado en vivo mientras se escribe, con espera de 150 ms (debounce). En herramientas pesadas, botón "Procesar". |
| RF-C5 | Errores en línea junto al campo (`aria-describedby`), con línea y columna cuando aplique. Nunca un error genérico sin explicación. |
| RF-C6 | Sección "Cómo se usa" con 2–4 frases y un ejemplo, presente en el HTML generado (para SEO). |
| RF-C7 | Procesos pesados (imágenes, archivos de más de 1 MB, diff de más de 5.000 líneas) en Web Worker para no congelar la interfaz. |
| RF-C8 | Límite por defecto de 10 MB por archivo; si se supera, se muestra el error "El archivo supera el límite de 10 MB". |

### 5.2 Escenarios BDD del núcleo

```gherkin
# language: es
Característica: RF-02 Búsqueda de herramientas
  Como usuario
  Quiero buscar herramientas por nombre o palabra clave
  Para encontrar rápido la que necesito

  Antecedentes:
    Dado que estoy en la página de inicio

  Escenario: Buscar por nombre sin acentos
    Cuando escribo "conversion" en el buscador
    Entonces veo las herramientas cuyo nombre contiene "conversión"

  Escenario: Buscar por palabra clave
    Cuando escribo "wcag" en el buscador
    Entonces veo la herramienta "Verificador de contraste"

  Escenario: Sin resultados
    Cuando escribo "zzzz" en el buscador
    Entonces veo el mensaje "No encontramos herramientas para «zzzz»"
    Y veo un botón "Limpiar búsqueda"

  Escenario: Atajo de teclado
    Cuando presiono "Control+K"
    Entonces el foco está en el buscador
```

```gherkin
# language: es
Característica: RF-05 Navegación por URL
  Escenario: Abrir una herramienta desde el listado
    Dado que estoy en la página de inicio
    Cuando hago clic en la fila "Formateador JSON"
    Entonces la URL es "/formateador-json/"
    Y veo el título "Formateador JSON"
    Y no veo el listado de herramientas

  Escenario: Volver con el botón Atrás del navegador
    Dado que abrí "Formateador JSON" desde el inicio
    Cuando uso el botón Atrás del navegador
    Entonces veo el listado de herramientas

  Escenario: Abrir directamente una URL
    Cuando visito "/verificador-contraste/"
    Entonces veo el título "Verificador de contraste"

  Escenario: URL inexistente
    Cuando visito "/no-existe/"
    Entonces veo el título "Página no encontrada"
    Y veo el buscador de herramientas
```

```gherkin
# language: es
Característica: RF-07 y RF-08 Favoritos y recientes
  Escenario: Marcar una favorita
    Dado que estoy en la herramienta "Generador UUID"
    Cuando pulso el botón "Agregar a favoritos"
    Entonces el botón cambia a "Quitar de favoritos"
    Y "Generador UUID" aparece en la sección "Favoritos"

  Escenario: Los favoritos persisten
    Dado que "Generador UUID" es favorita
    Cuando recargo la página
    Entonces "Generador UUID" sigue en la sección "Favoritos"

  Escenario: Recientes ordenadas y limitadas
    Dado que abrí 12 herramientas distintas
    Cuando voy a "Recientes"
    Entonces veo 10 herramientas
    Y la primera es la última que abrí
```

```gherkin
# language: es
Característica: RF-12 Borrar mis datos
  Escenario: Confirmar el borrado
    Dado que tengo favoritos y recientes guardados
    Cuando pulso "Borrar mis datos"
    Entonces veo un diálogo con el texto "¿Borrar favoritos, recientes y preferencias?"
    Cuando pulso "Borrar"
    Entonces la sección "Favoritos" está vacía
    Y veo el aviso "Tus datos se borraron"

  Escenario: Cancelar el borrado
    Dado que tengo favoritos guardados
    Cuando pulso "Borrar mis datos"
    Y pulso "Cancelar"
    Entonces mis favoritos siguen guardados
    Y el foco vuelve al botón "Borrar mis datos"
```

```gherkin
# language: es
Característica: RNF-03 Privacidad
  Esquema del escenario: Ninguna herramienta envía datos
    Dado que estoy en la herramienta "<herramienta>"
    Y registro todas las peticiones de red
    Cuando cargo el ejemplo y ejecuto la herramienta
    Entonces ninguna petición contiene el texto de entrada
    Y no hay peticiones a dominios distintos al del sitio

    Ejemplos:
      | herramienta          |
      | Decodificador JWT    |
      | Formateador JSON     |
      | Compresor de imágenes |
```

---

## 6. Catálogo de herramientas v1

Prioridad: **P0** = obligatoria para el lanzamiento, **P1** = primera actualización, **P2** = posterior.
Cada fila es la especificación mínima. Al implementar se amplía en su `meta.json` y `.feature`.

### 6.1 Desarrolladores (38)

#### Formateadores y validadores

| Id | Herramienta | Ruta | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- |
| DEV-01 | Formateador JSON | `/formateador-json/` | P0 | Texto JSON → JSON formateado (2/4 espacios, tab), minificado o vista de árbol plegable | JSON inválido muestra línea y columna del error |
| DEV-02 | Formateador SQL | `/formateador-sql/` | P1 | SQL → SQL indentado con palabras clave en mayúsculas | No altera literales entre comillas |
| DEV-03 | Formateador XML | `/formateador-xml/` | P1 | XML → XML indentado o minificado | XML mal formado muestra el error de `DOMParser` en español |
| DEV-04 | Validador JSON Schema | `/validador-esquema-json/` | P2 | JSON + esquema → válido / lista de errores con ruta | Soporta `type`, `required`, `properties`, `items`, `enum`, `minimum`, `maximum`, `pattern` |

#### Convertidores

| Id | Herramienta | Ruta | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- |
| DEV-05 | JSON ↔ YAML | `/json-yaml/` | P0 | JSON o YAML → el otro formato | Ida y vuelta conserva los datos (mapas, listas, cadenas, números, booleanos, null) |
| DEV-06 | JSON ↔ CSV | `/json-csv/` | P1 | Arreglo de objetos JSON ↔ CSV | Escapa comas y comillas; elige separador `,` `;` o tab |
| DEV-07 | Bases numéricas | `/bases-numericas/` | P0 | Número en base 2, 8, 10 o 16 → las otras tres | Soporta enteros grandes con `BigInt`; rechaza dígitos inválidos para la base |
| DEV-08 | Fecha y Unix timestamp | `/fecha-unix/` | P0 | Timestamp (s o ms) ↔ fecha | Muestra ISO 8601, UTC, zona local y otra zona elegida; botón "Ahora" |
| DEV-09 | Expresiones cron | `/cron/` | P1 | Expresión cron de 5 campos → explicación en español y próximas 5 ejecuciones | Expresión inválida indica qué campo está mal |
| DEV-10 | Unidades CSS | `/unidades-css/` | P0 | Valor + unidad + tamaño base → px, rem, em, %, vw, vh | Con base 10px, 16px = 1.6rem |
| DEV-11 | cURL a código | `/curl-a-codigo/` | P1 | Comando cURL → `fetch` JS, Python `requests`, C# `HttpClient` | Conserva método, cabeceras, cuerpo y `-u` |

#### Codificadores y decodificadores

| Id | Herramienta | Ruta | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- |
| DEV-12 | Base64 texto | `/base64/` | P0 | Texto ↔ Base64 (estándar y URL-safe) | "ñandú" codifica y decodifica sin perder caracteres (UTF-8) |
| DEV-13 | Base64 imagen / archivo | `/base64-archivo/` | P0 | Archivo ↔ Data URI | Vista previa si es imagen; descarga del archivo decodificado |
| DEV-14 | URL encode / decode | `/codificador-url/` | P0 | Texto ↔ texto codificado; URL → tabla de partes y parámetros | Distingue `encodeURI` y `encodeURIComponent` |
| DEV-15 | Entidades HTML | `/entidades-html/` | P0 | Texto ↔ texto con entidades | Escapa `< > & " '` y opcionalmente todo lo no ASCII |
| DEV-16 | Decodificador JWT | `/jwt/` | P0 | JWT → header y payload formateados, fechas `iat`/`exp`/`nbf` legibles | Etiqueta "Expirado" si `exp` pasó; verifica firma HS256 si se da la clave (Web Crypto); herramienta sensible (no guarda entrada) |
| DEV-17 | GZip / Deflate | `/gzip/` | P1 | Texto ↔ Base64 comprimido | Usa `CompressionStream`; muestra tamaño antes y después |
| DEV-18 | Generador QR | `/generador-qr/` | P0 | Texto, URL, WiFi o vCard → QR | Exporta PNG y SVG; nivel de corrección L/M/Q/H; tamaño ajustable |
| DEV-19 | Lector QR | `/lector-qr/` | P2 | Imagen → texto del QR | Usa `BarcodeDetector`; si el navegador no lo tiene, muestra "Tu navegador no admite esta función" |

#### Generadores

| Id | Herramienta | Ruta | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- |
| DEV-20 | Hash y checksum | `/hash/` | P0 | Texto o archivo → MD5, SHA-1, SHA-256, SHA-512 | "abc" en SHA-256 = `ba7816bf…f20015ad`; MD5 implementado en el proyecto; archivos en Worker |
| DEV-21 | HMAC | `/hmac/` | P1 | Mensaje + clave + algoritmo → firma hex y Base64 | Coincide con vectores de prueba RFC 4231; herramienta sensible |
| DEV-22 | UUID / ULID / NanoID | `/uuid/` | P0 | Tipo + cantidad (1–1000) → lista | UUID v4 y v7 válidos según RFC 9562; copiar todo |
| DEV-23 | Contraseñas | `/contrasenas/` | P0 | Longitud (8–128) y tipos de caracteres → contraseña y entropía en bits | Usa `crypto.getRandomValues`; nunca `Math.random`; herramienta sensible |
| DEV-24 | Lorem ipsum | `/lorem/` | P0 | Cantidad + unidad (palabras, frases, párrafos) + idioma (latín/español) → texto | Cantidad exacta de la unidad pedida |
| DEV-25 | Datos falsos | `/datos-falsos/` | P1 | Campos + cantidad → JSON o CSV | Nombres, correos, teléfonos, direcciones, RFC y CURP con formato válido pero ficticios |
| DEV-26 | JSON a tipos | `/json-a-tipos/` | P0 | JSON → interfaces TypeScript, clases C#, modelos Pydantic | Infiere opcionales y arreglos de objetos; nombres de clase en PascalCase |
| DEV-27 | Tablas Markdown | `/tabla-markdown/` | P1 | CSV o editor de celdas → tabla Markdown | Alineación por columna; escapa `|` |

#### Texto

| Id | Herramienta | Ruta | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- |
| DEV-28 | Probador de regex | `/regex/` | P0 | Patrón + banderas + texto → coincidencias resaltadas, grupos y reemplazo | Patrón inválido muestra el error; corta a los 500 ms para evitar bloqueos (Worker) |
| DEV-29 | Comparador de texto | `/comparador-texto/` | P0 | Texto A + texto B → diff por línea y por carácter, lado a lado o unificado | Ignorar espacios opcional; contadores de líneas agregadas y eliminadas |
| DEV-30 | Comparar listas | `/comparar-listas/` | P1 | Lista A + lista B → unión, intersección, solo A, solo B, duplicados | Opción de ignorar mayúsculas y espacios |
| DEV-31 | Escapar cadenas | `/escapar-cadenas/` | P1 | Texto → literal escapado para JSON, JavaScript, C#, Python, SQL | Ida y vuelta devuelve el texto original |
| DEV-32 | Utilidades de texto | `/utilidades-texto/` | P0 | Texto → conteos (caracteres, palabras, líneas), ordenar, quitar duplicados, cambiar caso (camel, snake, kebab, Pascal, título) | Cuenta emojis y acentos como un carácter (`Intl.Segmenter`) |
| DEV-33 | Slug | `/slug/` | P0 | Texto → slug | "¡Hola, Mañana Ñu!" → "hola-manana-nu" |
| DEV-34 | Vista previa Markdown | `/vista-previa-markdown/` | P1 | Markdown → vista previa y HTML | HTML generado sin `<script>` ni atributos `on*`; vista previa construida con `createElement` |
| DEV-35 | JSONPath | `/jsonpath/` | P2 | JSON + expresión → resultados | Soporta `$`, `.`, `[]`, `*`, `..` y filtros simples `?(@.x == y)` |
| DEV-36 | Analizador de User-Agent | `/analizador-user-agent/` | P2 | Cadena UA (por defecto la propia) → navegador, versión, SO, dispositivo | Reconoce Chrome, Edge, Firefox, Safari, Opera en escritorio y móvil |

#### Red y referencia

| Id | Herramienta | Ruta | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- |
| DEV-37 | Calculadora de subredes | `/subredes/` | P1 | IPv4/CIDR → red, broadcast, máscara, rango y número de hosts | `192.168.1.10/24` → red `192.168.1.0`, 254 hosts |
| DEV-38 | Códigos HTTP | `/codigos-http/` | P1 | Búsqueda → código, nombre y explicación en español | Incluye todos los códigos de 1xx a 5xx de uso común |

### 6.2 Diseño UX/UI y gráfico (30)

#### Color

| Id | Herramienta | Ruta | Perfil | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- | --- |
| DIS-01 | Convertidor de color | `/convertidor-color/` | uxui, gráfico | P0 | Un color en cualquier formato → HEX, RGB, HSL, HWB, OKLCH, CMYK aproximado | `#FF0000` = `rgb(255 0 0)` = `hsl(0 100% 50%)`; CMYK marcado como aproximado |
| DIS-02 | Verificador de contraste | `/verificador-contraste/` | uxui | P0 | Color de texto + fondo → ratio WCAG 2.2, cumplimiento AA/AAA (normal y grande), valor APCA | 21:1 para negro/blanco; sugiere el color más cercano que cumple AA |
| DIS-03 | Generador de paletas | `/paletas/` | uxui, gráfico | P0 | Color base + armonía (complementaria, análoga, tríada, tétrada, monocromática) → 5 colores | Exporta CSS, JSON y PNG; bloquear colores y regenerar el resto |
| DIS-04 | Escala de tonos | `/escala-tonos/` | uxui | P0 | Color base → escala 50–950 en OKLCH | El color base queda en el tono 500; exporta variables CSS `--color-500` |
| DIS-05 | Paleta desde imagen | `/paleta-imagen/` | gráfico | P1 | Imagen → 3–10 colores dominantes con porcentaje | Procesa en Worker; misma imagen da el mismo resultado (semilla fija) |
| DIS-06 | Cuentagotas de pantalla | `/cuentagotas/` | uxui, gráfico | P1 | Clic en la pantalla → color en HEX/RGB/HSL + historial | Usa `EyeDropper`; mensaje claro si el navegador no lo admite |
| DIS-07 | Simulador de daltonismo | `/simulador-daltonismo/` | uxui | P1 | Imagen o paleta → vista con protanopia, deuteranopia, tritanopia, acromatopsia | Vista lado a lado con la original |
| DIS-08 | Generador de degradados | `/degradados/` | uxui | P0 | Tipo (lineal, radial, cónico) + paradas de color + ángulo → vista previa y CSS | Agregar, mover y quitar paradas con teclado |
| DIS-09 | Mezclador de colores | `/mezclador-color/` | gráfico | P2 | Dos colores + pasos → colores intermedios | Mezcla en OKLCH y en sRGB, a elección |

#### Tipografía y layout

| Id | Herramienta | Ruta | Perfil | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- | --- |
| DIS-10 | Escala tipográfica | `/escala-tipografica/` | uxui | P0 | Tamaño base + razón (1.125, 1.2, 1.25, 1.333, 1.5, 1.618) → tamaños h1–h6, cuerpo y pequeño | Valores en rem y px; vista previa con texto editable; exporta CSS |
| DIS-11 | Generador `clamp()` fluido | `/clamp-fluido/` | uxui, dev | P0 | Tamaño mín/máx + ancho de pantalla mín/máx → `clamp()` | Valor en el ancho mínimo y máximo coincide con lo pedido (±0.01rem) |
| DIS-12 | Probador de fuentes locales | `/probador-fuentes/` | gráfico | P1 | Archivo .ttf, .otf, .woff, .woff2 → vista previa con texto, tamaños y pesos | Usa `FontFace`; la fuente no sale del navegador |
| DIS-13 | Generador de grid CSS | `/grid-css/` | uxui, dev | P1 | Columnas, filas, separación y áreas → vista previa y CSS | Nombrar áreas y exportar `grid-template-areas` |
| DIS-14 | Playground Flexbox | `/flexbox/` | uxui, dev | P1 | Propiedades del contenedor y de los elementos → vista en vivo y CSS | Cubre `direction`, `wrap`, `justify-content`, `align-items`, `gap`, `grow`, `shrink`, `basis` |
| DIS-15 | Calculadora de relación de aspecto | `/relacion-aspecto/` | uxui, gráfico | P0 | Ancho y alto o relación → relación simplificada y medida faltante | 1920×1080 → 16:9; preajustes de redes sociales |
| DIS-16 | Escala de espaciado | `/escala-espaciado/` | uxui | P1 | Base (4 u 8) + pasos → escala en px y rem | Exporta tokens CSS y JSON |

#### Efectos y CSS visual

| Id | Herramienta | Ruta | Perfil | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- | --- |
| DIS-17 | Generador de sombras | `/sombras/` | uxui | P0 | Capas (x, y, desenfoque, extensión, color, inset) → vista previa y CSS | Varias capas en orden; preajustes de elevación |
| DIS-18 | Border-radius y formas | `/bordes-redondeados/` | uxui | P1 | Radios por esquina o forma orgánica → vista previa, CSS y SVG | Sintaxis de 8 valores para formas orgánicas |
| DIS-19 | Glassmorphism | `/glassmorphism/` | uxui | P2 | Fondo, transparencia, desenfoque, borde → vista previa y CSS | Avisa si el contraste del texto sobre el vidrio no cumple AA |
| DIS-20 | Editor cubic-bezier | `/cubic-bezier/` | uxui, dev | P1 | Puntos de control → curva, vista de animación y CSS | Preajustes `ease`, `ease-in`, `ease-out`, `ease-in-out`; puntos movibles con teclado |
| DIS-21 | Generador de patrones | `/patrones/` | gráfico | P2 | Tipo (puntos, líneas, cuadrícula, zigzag) + colores + tamaño → SVG y CSS | Patrón repetible sin cortes visibles |

#### Imágenes y assets

| Id | Herramienta | Ruta | Perfil | Prio | Entrada → Salida | Criterio clave de aceptación |
| --- | --- | --- | --- | --- | --- | --- |
| DIS-22 | Convertidor de imagen | `/convertidor-imagen/` | gráfico | P0 | Imagen(es) → PNG, JPG, WebP (AVIF si el navegador lo admite) | Lote de hasta 20 imágenes; descarga individual o todas; transparencia a JPG con fondo elegible |
| DIS-23 | Compresor de imágenes | `/compresor-imagen/` | gráfico | P0 | Imagen(es) + calidad (10–100) → imagen comprimida | Muestra tamaño antes, después y % ahorrado; comparación con deslizador; Worker con `OffscreenCanvas` cuando exista |
| DIS-24 | Redimensionar y recortar | `/redimensionar-imagen/` | gráfico | P0 | Imagen + medidas o % o preajuste → imagen | Mantener proporción opcional; recortes para Instagram, Facebook, X, LinkedIn, YouTube |
| DIS-25 | Optimizador SVG | `/optimizador-svg/` | uxui, gráfico | P0 | SVG → SVG limpio y minificado | Elimina metadatos, comentarios y atributos de editores; quita `<script>` y `on*`; vista previa antes/después y % ahorrado |
| DIS-26 | SVG a componente | `/svg-a-componente/` | uxui, dev | P1 | SVG → componente JSX, Vue o Data URI para CSS | Atributos convertidos a camelCase en JSX |
| DIS-27 | Generador de favicons | `/favicon/` | uxui, dev | P0 | Imagen cuadrada → `favicon.ico` (16, 32, 48), PNG 180 y 512, `manifest` y etiquetas `<link>` | Descarga en un `.zip` creado en el navegador (formato ZIP sin compresión implementado en el proyecto) |
| DIS-28 | Imágenes placeholder | `/imagen-marcador/` | uxui | P1 | Ancho, alto, color de fondo y texto → PNG o SVG | Texto por defecto "ancho×alto" |
| DIS-29 | Vista previa Open Graph | `/vista-previa-open-graph/` | uxui, dev | P1 | Título, descripción, imagen y URL → maquetas de cómo se ve en redes, y etiquetas `<meta>` | Avisa si el título supera 60 caracteres o la descripción 160 |
| DIS-30 | Tokens de diseño | `/tokens-diseno/` | uxui, dev | P1 | JSON de tokens (formato W3C Design Tokens) → variables CSS, SCSS o módulo JS | Resuelve alias (`{color.primary}`); error claro si un alias no existe |

### 6.3 Escenarios BDD de referencia por herramienta

Estos ejemplos fijan el nivel de detalle esperado para el resto.

```gherkin
# language: es
Característica: DIS-02 Verificador de contraste
  Como diseñador UX/UI
  Quiero saber si dos colores cumplen WCAG
  Para asegurar que el texto sea legible

  Esquema del escenario: Cálculo del ratio
    Dado que el color de texto es "<texto>"
    Y el color de fondo es "<fondo>"
    Entonces el ratio mostrado es "<ratio>"
    Y el resultado para texto normal es "<normal>"

    Ejemplos:
      | texto   | fondo   | ratio   | normal    |
      | #000000 | #FFFFFF | 21:1    | AAA       |
      | #777777 | #FFFFFF | 4.48:1  | No cumple |
      | #595959 | #FFFFFF | 7:1     | AAA       |

  Escenario: Sugerencia de color accesible
    Dado que el color de texto es "#AAAAAA"
    Y el color de fondo es "#FFFFFF"
    Entonces veo el aviso "No cumple AA para texto normal"
    Y veo un color sugerido con ratio de al menos 4.5:1

  Escenario: Color inválido
    Cuando escribo "#ZZZ" como color de texto
    Entonces veo el error "Color no válido" junto al campo
    Y no se muestra ningún ratio
```

```gherkin
# language: es
Característica: DIS-23 Compresor de imágenes
  Como diseñador gráfico
  Quiero reducir el peso de mis imágenes
  Para publicarlas sin perder calidad visible

  Escenario: Comprimir una imagen JPG
    Dado que cargo "foto.jpg" de 2 MB
    Cuando elijo calidad 70
    Y pulso "Procesar"
    Entonces veo el tamaño original "2.0 MB"
    Y veo el tamaño final menor que el original
    Y veo el porcentaje ahorrado
    Y puedo descargar "foto-comprimida.jpg"

  Escenario: Archivo que no es imagen
    Cuando cargo "documento.pdf"
    Entonces veo el error "El archivo no es una imagen compatible"

  Escenario: Archivo demasiado grande
    Cuando cargo una imagen de 15 MB
    Entonces veo el error "El archivo supera el límite de 10 MB"

  Escenario: La interfaz no se congela
    Dado que cargo 10 imágenes
    Cuando pulso "Procesar"
    Entonces veo el indicador de carga con el avance "1 de 10"
    Y puedo seguir desplazándome por la página
```

```gherkin
# language: es
Característica: DEV-01 Formateador JSON
  Escenario: Formatear JSON válido
    Dado que pego '{"a":1,"b":[1,2]}'
    Cuando elijo indentación de 2 espacios
    Entonces la salida tiene 7 líneas
    Y la línea 2 es '  "a": 1,'

  Escenario: JSON inválido
    Dado que pego '{"a":1,}'
    Entonces veo el error "JSON no válido en la línea 1, columna 8"

  Escenario: Minificar
    Dado que pego un JSON formateado
    Cuando pulso "Minificar"
    Entonces la salida no contiene saltos de línea ni espacios fuera de cadenas
```

```gherkin
# language: es
Característica: DEV-16 Decodificador JWT
  Escenario: Decodificar un token
    Dado que pego un JWT de ejemplo válido
    Entonces veo el header con "alg": "HS256"
    Y veo el payload formateado
    Y veo la fecha de expiración en mi zona horaria

  Escenario: Token expirado
    Dado que pego un JWT con "exp" en el pasado
    Entonces veo la etiqueta "Expirado"

  Escenario: Verificar firma
    Dado que pego un JWT firmado con la clave "secreto"
    Cuando escribo "secreto" en el campo de clave
    Entonces veo "Firma válida"
    Cuando escribo "otra" en el campo de clave
    Entonces veo "Firma no válida"

  Escenario: No se guarda la entrada
    Dado que pegué un JWT
    Cuando recargo la página
    Entonces el campo de entrada está vacío
```

### 6.4 Ejemplo de prueba TDD inicial

```javascript
// codigo/herramientas/verificador-contraste/logica.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { relacionContraste, nivelesWcag } from './logica.js';

describe('DIS-02 relacionContraste', () => {
  test('negro sobre blanco es 21', () => {
    assert.equal(relacionContraste('#000000', '#FFFFFF'), 21);
  });

  test('el orden de los colores no cambia el resultado', () => {
    assert.equal(relacionContraste('#FFFFFF', '#000000'), 21);
  });

  test('#777777 sobre blanco es 4.48', () => {
    assert.equal(relacionContraste('#777777', '#FFFFFF'), 4.48);
  });

  test('acepta HEX corto', () => {
    assert.equal(relacionContraste('#000', '#FFF'), 21);
  });

  test('color inválido lanza COLOR_INVALIDO', () => {
    assert.throws(
      () => relacionContraste('#ZZZ', '#FFFFFF'),
      { codigo: 'COLOR_INVALIDO' }
    );
  });
});

describe('DIS-02 nivelesWcag', () => {
  test('4.48 no cumple AA normal pero sí AA grande', () => {
    assert.deepEqual(nivelesWcag(4.48), {
      normal: { aa: false, aaa: false },
      grande: { aa: true, aaa: false },
    });
  });
});
```

---

## 7. Requerimientos no funcionales

| Id | Requerimiento | Meta medible | Cómo se verifica |
| --- | --- | --- | --- |
| RNF-01 | Rendimiento | Lighthouse Performance ≥ 95; LCP < 1.5 s en 4G simulado; JS inicial < 50 KB sin comprimir | Lighthouse en Chrome DevTools antes de cada versión |
| RNF-02 | Accesibilidad | WCAG 2.2 AA; uso completo con teclado; foco siempre visible | axe en cada E2E con 0 violaciones; revisión manual con lector de pantalla en P0 |
| RNF-03 | Privacidad | Ninguna petición de red con datos del usuario; sin cookies; sin analítica que lea contenido | E2E con registro de red (sección 5.2) |
| RNF-04 | Seguridad | CSP: `default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; worker-src 'self' blob:`; sin `unsafe-inline` ni `unsafe-eval`; HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` | Archivo `_headers` del hosting; revisión con observatorio de seguridad |
| RNF-05 | Sin conexión | Toda herramienta visitada abre y funciona sin red | E2E en modo offline de Playwright |
| RNF-06 | Responsive | Usable de 360px a 2560px; objetivos táctiles ≥ 4.4rem (44px) | E2E en viewports 360, 768, 1280 |
| RNF-07 | Compatibilidad | Últimas 2 versiones de Chrome, Edge, Firefox y Safari | E2E en Chromium, Firefox y WebKit |
| RNF-08 | SEO | Cada `/<id>/` tiene `<title>`, `meta description`, `<h1>`, Open Graph, `canonical` y "Cómo se usa" en el HTML inicial; `sitemap.xml` y `robots.txt` | Prueba del build que revisa cada HTML generado |
| RNF-09 | Idioma | 100 % de textos visibles en `i18n/es.json`; ningún texto fijo en `vista.js` | Prueba que busca cadenas literales visibles en `vista.js` |
| RNF-10 | Mantenibilidad | Agregar una herramienta no requiere modificar el núcleo, solo su carpeta y el manifiesto | Revisión de código |
| RNF-11 | Calidad | Cobertura ≥ 90 % de líneas en `logica.js` | `npm test` |
| RNF-12 | Tamaño por herramienta | Módulo de cada herramienta < 30 KB sin comprimir (excepto las de `vendor`) | Prueba del build |

---

## 8. Diseño de interfaz

- Base visual: la sección "Identidad visual" de `AGENTS.md`.
- Diseño simple, usable y accesible. Usar la skill de diseño frontend cargada en el proyecto.
- Tokens obligatorios en `css/tokens.css`: colores (fondo, superficie, texto, texto secundario, primario, borde, éxito, aviso, error) para tema claro y oscuro; tipografía (familia, escala en rem); espaciado (escala de 4px expresada en rem); radios; sombras; duración de transiciones.
- Respetar `prefers-reduced-motion` y `prefers-color-scheme`.
- Iconos en SVG propios, con `aria-hidden="true"`. Los botones que solo tienen icono llevan `aria-label`.
- Enlace "Saltar al contenido" como primer elemento enfocable.

---

## 9. Plan de entregas de la v1

| Hito | Contenido | Criterio de salida |
| --- | --- | --- |
| H0 — Base | Estructura de carpetas, `package.json`, `serve.js`, `build.js`, núcleo (RF-01 a RF-12, RF-15, RF-16), componentes compartidos, tokens y temas | Escenarios del núcleo en verde; Lighthouse ≥ 95 en inicio |
| H1 — P0 desarrollo | Herramientas DEV con prioridad P0 (20) | Definición de terminado en cada una |
| H2 — P0 diseño | Herramientas DIS con prioridad P0 (14) | Definición de terminado en cada una |
| H3 — Lanzamiento v1.0 | PWA (RF-17), SEO completo, `_headers`, páginas legales, dominio | Checklist de lanzamiento (sección 11) |
| H4 — v1.1 | Herramientas P1 (27) y RF-13, RF-14 | Definición de terminado |
| H5 — v1.2 | Herramientas P2 (7) y RF-18 | Definición de terminado |

Conteo: P0 = 34 herramientas, P1 = 27, P2 = 7 (total 68).

---

## 10. Definición de terminado (por herramienta o funcionalidad)

- [ ] `meta.json` completo y coherente con la fila del catálogo.
- [ ] `.feature` con escenario normal, de error y de caso límite.
- [ ] `logica.test.js` cubre cada criterio de aceptación; cobertura de `logica.js` ≥ 90 %.
- [ ] E2E del `.feature` en verde en Chromium, Firefox y WebKit.
- [ ] axe sin violaciones.
- [ ] Funciona con teclado de principio a fin.
- [ ] Sin texto fijo en `vista.js`; textos en `es.json`.
- [ ] Cumple las reglas de código y estilos (sección 2).
- [ ] Registrada en `herramientas.manifiesto.json` con descripción SEO y palabras clave.
- [ ] Sin peticiones de red con datos del usuario.

---

## 11. Checklist de lanzamiento v1.0

- [ ] Las 34 herramientas P0 cumplen la definición de terminado.
- [ ] `sitemap.xml`, `robots.txt`, Open Graph e imagen social por herramienta.
- [ ] Manifest PWA, iconos y Service Worker probados sin conexión.
- [ ] Archivo `_headers` con CSP y cabeceras de seguridad.
- [ ] Páginas "Acerca de", "Privacidad" y "Términos de uso".
- [ ] Página 404.
- [ ] Dominio propio con HTTPS.
- [ ] Alta en Google Search Console y Bing Webmaster Tools.
- [ ] Lighthouse ≥ 95 en las 4 categorías para inicio y 5 herramientas.

---

## 12. Notas para la v2 (no implementar en v1)

Dejar el código preparado, sin construir nada de esto:

- `nucleo/almacenamiento.js` con una interfaz (`obtener`, `guardar`, `quitar`, `vaciar`) que en v2 pueda tener una implementación en la nube.
- `herramientas.manifiesto.json` admite un campo `plan` (`"gratis"` por defecto) para marcar herramientas o funciones de pago en el futuro.
- Ningún componente debe suponer que no habrá usuario: el encabezado deja espacio para un botón de cuenta.

La definición de cobro, cuentas, backend e IA se especificará en `documentacion/requerimientos-v2.md`.

---

## 13. Preguntas abiertas

| Id | Pregunta | Impacto |
| --- | --- | --- |
| PA-01 | **Resuelta:** el prototipo tenía 14 herramientas; 13 corresponden al catálogo y el decodificador de certificado aún no tiene id. | Define qué se migra en H0 |
| PA-02 | **Parcial:** nombre elegido, Navaja; falta revisar la marca en el IMPI y comprar el dominio (`navaja.dev`). | SEO, canonical, manifest |
| PA-03 | **Resuelta:** código abierto bajo AGPL-3.0-only (ver `LICENSE` y `AGENTS.md`). | Licencia, `README`, estrategia de v2 |
| PA-04 | ¿Se aceptan anuncios discretos en la v1? | Privacidad, CSP y hosting |
| PA-05 | Mercado principal: ¿México, Latinoamérica o todo el mundo hispanohablante? | Datos de ejemplo, formatos de fecha y moneda |
