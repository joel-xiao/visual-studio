import { App, readonly } from 'vue';
import { cloneDeep } from 'lodash';
import { createComponent } from '@hooks/vue-hooks';
import type { ComponentData } from './../../panels/components/panel-component/interface';
import type { UseComponent } from './interface';
import type {
  SchemaExport,
  SchemaKeysTypes,
  SchemaKeyTypes,
  ComponentSchemaExport,
  ComponentProp,
  ComponentProps
} from './../../schema/use/interface';

export class UiLibrary {
  libraryUses: Record<string, { [key: string]: UseComponent }>;
  componentUses: Record<string, { [key: string]: UseComponent }>;
  components: Record<string, { [key: string]: App }>;
  componentSchemas: Record<string, { [key: string]: ComponentSchemaExport }>;
  constructor() {
    this.libraryUses = {};
    this.componentUses = {};
    this.components = {};
    this.componentSchemas = {};

    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
    this.getUiLibrary = this.getUiLibrary.bind(this);
    this.createNodeComponent = this.createNodeComponent.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.getComponentSchema = this.getComponentSchema.bind(this);
    this.getComponentProps = this.getComponentProps.bind(this);
    this.getComponentPropsTypes = this.getComponentPropsTypes.bind(this);
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
      const schema: ComponentSchemaExport = this.componentSchemas[path].default;
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

    return cloneDeep(schemas);
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

    return cloneDeep(components);
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
    return cloneDeep([
      {
        name: '本地',
        id: 'local',
        children: children
      }
    ]);
  }

  createNodeComponent(
    props: ComponentProps,
    parentEl: HTMLElement | undefined,
    component: App
  ): App {
    return createComponent<{ data: ComponentProps }>('component', parentEl, component, {
      data: props
    });
  }

  #getComponent(component_path: string): App {
    return cloneDeep(this.components[component_path].default);
  }
  getComponent(component_path: string): App {
    return this.#getComponent(component_path);
  }

  #getComponentSchema(schema_path: string): ComponentSchemaExport {
    return cloneDeep(this.componentSchemas[schema_path].default);
  }
  getComponentSchema(schema_path: string): ComponentSchemaExport {
    return this.#getComponentSchema(schema_path);
  }

  #getComponentPropsTypes(
    schema_path: string,
    schemas: { [Key: string]: SchemaExport }
  ): SchemaKeysTypes {
    const componentSchemas = this.getComponentSchema(schema_path);
    const propsTypes: SchemaKeysTypes = {};

    if (
      componentSchemas &&
      typeof componentSchemas === 'object' &&
      Array.isArray(componentSchemas.schemas)
    ) {
      componentSchemas.schemas
        .filter((schema) => schema && typeof schema === 'object' && !Array.isArray(schema))
        .forEach((component_schema) => {
          const schema = schemas[component_schema.schema];
          const schema_data: SchemaKeyTypes | null =
            !Array.isArray(schema) && typeof schema === 'object'
              ? //@ts-ignore
                schema[component_schema.type]
              : null;

          const propTypes: SchemaKeyTypes = {};

          const is_schema =
            schema_data && !Array.isArray(schema_data) && typeof schema_data === 'object';
          if (is_schema && schema_data) {
            Object.keys(schema_data).forEach((key) => {
              schema_data && (propTypes[key] = schema_data[key]);
            });
          }

          schema && schema.key && (propsTypes[schema.key] = propTypes);
        });
    }
    return readonly(propsTypes);
  }
  getComponentPropsTypes(
    schema_path: string,
    schemas: { [Key: string]: SchemaExport }
  ): SchemaKeysTypes {
    return this.#getComponentPropsTypes(schema_path, schemas);
  }

  #getComponentProps(
    schema_path: string,
    schemas: { [Key: string]: SchemaExport }
  ): ComponentProps {
    const componentSchemas = this.getComponentSchema(schema_path);
    const props: ComponentProps = {};
    if (
      componentSchemas &&
      typeof componentSchemas === 'object' &&
      Array.isArray(componentSchemas.schemas)
    ) {
      componentSchemas.schemas
        .filter((schema) => schema && typeof schema === 'object' && !Array.isArray(schema))
        .forEach((component_schema) => {
          const schema = schemas[component_schema.schema];
          const schema_data: SchemaKeyTypes | null =
            !Array.isArray(schema) && typeof schema === 'object'
              ? //@ts-ignore
                schema[component_schema.type]
              : null;

          const is_schema =
            schema_data && !Array.isArray(schema_data) && typeof schema_data === 'object';

          const is_component_schema_default =
            component_schema &&
            !Array.isArray(component_schema) &&
            typeof component_schema === 'object' &&
            component_schema.default;

          const is_component_schema_default_object =
            is_component_schema_default &&
            !Array.isArray(component_schema.default) &&
            typeof component_schema.default === 'object';

          const component_schema_name =
            component_schema &&
            !Array.isArray(component_schema) &&
            typeof component_schema === 'object' &&
            component_schema.schema;

          const prop: ComponentProp = {};

          if (is_schema && component_schema_name) {
            const component_schema_default: ComponentProp = component_schema.default;
            Object.keys(schema_data).forEach((key) => {
              if (is_component_schema_default_object) {
                //@ts-ignore
                prop[key] = component_schema_default[key] || schema_data[key].default;
              } else if (is_component_schema_default) {
                //@ts-ignore
                prop[key] = component_schema_default || schema_data[key].default;
              } else {
                prop[key] = schema_data[key].default;
              }
            });
          }

          schema && schema.key && (props[schema.key] = prop);
        });
    }
    return cloneDeep(props);
  }
  getComponentProps(schema_path: string, schemas: { [Key: string]: SchemaExport }) {
    return this.#getComponentProps(schema_path, schemas);
  }
}
