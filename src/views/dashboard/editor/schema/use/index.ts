import { readonly } from 'vue';
import { cloneDeep } from 'lodash';
import type { SchemaExport } from './interface';
export class Schema {
  #schemas: { [key: string]: SchemaExport };
  constructor() {
    this.#schemas = {};

    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.getSchemas = this.getSchemas.bind(this);
  }

  #install() {
    Object.values(import.meta.globEager('./../**/*.ts')).forEach((schema) => {
      schema.default && (this.#schemas[schema.default.name] = schema.default);
    });
  }
  install() {
    this.#install();
  }

  #uninstall() {
    this.#schemas = {};
  }
  uninstall() {
    this.#uninstall();
  }

  #getSchemas(schema_names?: string | string[]): { [key: string]: SchemaExport } {
    const schemas: { [key: string]: SchemaExport } = {};

    if (typeof schema_names === 'string') {
      schemas[schema_names] = this.#schemas[schema_names];
    } else if (Array.isArray(schema_names)) {
      schema_names.forEach((schema_name) => {
        schemas[schema_name] = this.#schemas[schema_name];
      });
    } else {
      return cloneDeep(this.#schemas);
    }

    return cloneDeep(schemas);
  }
  getSchemas(schema_names?: string | string[]) {
    return this.#getSchemas(schema_names);
  }
}
