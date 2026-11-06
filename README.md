# Navaja

Herramientas para desarrollo y diseño que funcionan en tu navegador, en español, sin cuentas y sin enviar tus datos a ningún servidor.

## Empezar

Necesitas Node.js 20 o superior.

```bash
npm install
```

```bash
npm run desarrollo
```

La aplicación queda disponible en `http://localhost:5173`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run desarrollo` | Sirve `codigo/` en `http://localhost:5173` |
| `npm test` | Ejecuta las pruebas unitarias con cobertura |
| `npm run pruebas:e2e` | Ejecuta las pruebas de navegador y accesibilidad |
| `npm run construir` | Genera el sitio estático en `publicacion/` |

Para las pruebas de navegador instala antes los navegadores con `npx playwright install`.

## Documentación

- [AGENTS.md](AGENTS.md): cómo se desarrolla el proyecto, incluidas las reglas de idioma e identidad visual.
- [documentacion/requerimientos.md](documentacion/requerimientos.md): requerimientos y catálogo.
- [documentacion/terceros.md](documentacion/terceros.md): recursos de terceros.

## Licencia

Navaja se distribuye bajo la [GNU AGPL-3.0](LICENSE). © Ricardo Escalante Jauregui.

La licencia cubre el código. No concede derechos sobre el nombre ni el logotipo de Navaja.
