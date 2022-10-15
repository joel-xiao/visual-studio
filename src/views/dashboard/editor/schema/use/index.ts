export class UiLibrary {
  schemas: Record<string, { [key: string]: string }>;
  constructor() {
    this.schemas = {};

    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.getSchema = this.getSchema.bind(this);
  }

  #install() {
    this.schemas = import.meta.globEager('./../**/*.ts');
  }
  install() {
    this.#install();
  }

  #uninstall() {
    this.schemas = {};
  }
  uninstall() {
    this.#uninstall();
  }

  #getSchema(schema_path: string): string {
    return this.schemas[schema_path].default;
  }
  getSchema(schema_path: string): string {
    return this.#getSchema(schema_path);
  }
}
