import { App } from 'vue';
import type { ComponentData } from './../../panels/components/panel-component/interface';
import type { UseComponent, Schema } from './interface';

export class UiLibrary {
  libraryUses: Record<string, { [key: string]: UseComponent }>;
  componentUses: Record<string, { [key: string]: UseComponent }>;
  components: Record<string, { [key: string]: App }>;
  componentSchemas: Record<string, { [key: string]: Schema }>;
  constructor() {
    this.libraryUses = {};
    this.componentUses = {};
    this.components = {};
    this.componentSchemas = {};

    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.getUiLibrary = this.getUiLibrary.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.getComponentSchema = this.getComponentSchema.bind(this);
  }

  #install() {
    this.components = import.meta.globEager('./../*/*/index.vue');
    this.componentSchemas = import.meta.globEager('./../*/*/schema/*.ts');
  }
  install() {
    this.#install();
  }

  #uninstall() {
    this.componentUses = {};
    this.components = {};
    this.componentSchemas = {};
  }
  uninstall() {
    this.#uninstall();
  }

  #getIcon(icon: string): string {
    return `image/dashboard/editor/panel-component/${icon}`;
  }

  #getComponentSchemas(component_path: string): ComponentData[] {
    const schemas: ComponentData[] = [];

    for (const path of Object.keys(this.componentSchemas).filter(
      (key) => key && key.startsWith(component_path)
    )) {
      const component_path = path.substring(0, path.lastIndexOf('/schema/') + 1);
      const schema: Schema = this.componentSchemas[path].default;
      schemas.push({
        name: schema.name,
        id: schema.type,
        icon: this.#getIcon(schema.icon),
        data: {
          name: schema.name,
          icon: this.#getIcon(schema.icon),
          component: component_path + 'index.vue',
          schema: path
        }
      });
    }

    return schemas;
  }

  #getLibraryComponents(library_path: string): ComponentData[] {
    const components: ComponentData[] = [];

    for (const path of Object.keys(this.componentUses).filter(
      (key) => key && key.startsWith(library_path)
    )) {
      const component_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const component: UseComponent = this.componentUses[path].default;
      components.push({
        dot: true,
        component: true,
        name: component.name,
        id: component.id,
        children: this.#getComponentSchemas(component_path)
      });
    }

    return components;
  }

  getUiLibrary(): ComponentData[] {
    this.componentUses = import.meta.globEager('./../*/*/use.ts');
    this.libraryUses = import.meta.globEager('./../*/use.ts');

    const children: ComponentData[] = [];
    for (const path of Object.keys(this.libraryUses)) {
      const library_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const library: UseComponent = this.libraryUses[path].default;
      children.push({
        name: library.name,
        id: library.id,
        children: this.#getLibraryComponents(library_path)
      });
    }

    this.libraryUses = {};
    this.componentUses = {};
    return [
      {
        name: '本地',
        id: 'local',
        children: children
      }
    ];
  }

  #getComponent(component_path: string): App {
    return this.components[component_path].default;
  }
  getComponent(component_path: string): App {
    return this.#getComponent(component_path);
  }

  #getComponentSchema(schema_path: string): Schema {
    return this.componentSchemas[schema_path].default;
  }
  getComponentSchema(schema_path: string): Schema {
    return this.#getComponentSchema(schema_path);
  }
}
