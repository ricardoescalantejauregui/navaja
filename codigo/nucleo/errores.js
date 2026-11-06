// SPDX-License-Identifier: AGPL-3.0-only
// Error de dominio: la lógica lanza un código y la vista lo traduce a un mensaje.
export class ErrorHerramienta extends Error {
  constructor(codigo, datos = {}) {
    super(codigo);
    this.name = 'ErrorHerramienta';
    this.codigo = codigo;
    this.datos = datos;
  }
}
