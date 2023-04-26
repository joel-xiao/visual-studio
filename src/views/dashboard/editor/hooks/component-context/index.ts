import { App, readonly, createVNode, onBeforeUnmount } from 'vue';
import { cloneDeep } from 'lodash';
import { createComponent } from '@hooks/vue-hooks';
import type { ComponentData } from './../../panels/components/panel-component/interface';
import type {
  SchemaExport,
  SchemaKeyTypes,
  SchemaPropsTypes,
  SchemaPropTypes,
  ComponentSchemaExport,
  ComponentProp,
  ComponentProps,
  UseUILibraryComponent
} from './interface';

export class CreateComponentContext {
  UILibraryUses: Record<string, { [key: string]: UseUILibraryComponent }>;
  UILibraryComponentUses: Record<string, { [key: string]: UseUILibraryComponent }>;

  #schemas: { [key: string]: SchemaExport };
  componentSchemas: Record<string, { [key: string]: ComponentSchemaExport }>;
  components: Record<string, { [key: string]: App }>;
  constructor() {
    this.UILibraryUses = {};
    this.UILibraryComponentUses = {};

    this.#schemas = {};
    this.componentSchemas = {};
    this.components = {};

    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);

    this.getUiLibrary = this.getUiLibrary.bind(this);

    this.getComponentProps = this.getComponentProps.bind(this);
    this.formatterComponentProp = this.formatterComponentProp.bind(this);
    this.getComponentPropsTypes = this.getComponentPropsTypes.bind(this);
    this.createNodeComponent = this.createNodeComponent.bind(this);
    this.createNodeComponentApp = this.createNodeComponentApp.bind(this);
  }

  #install() {
    Object.values(
      import.meta.glob<SchemaExport>(['./../../schema/**/*.ts', '!./../../schema/**/*.d.ts'], {
        eager: true,
        import: 'default'
      })
    ).forEach((schema) => {
      schema && (this.#schemas[schema.name] = schema);
    });

    this.components = import.meta.glob(['./../../ui-library/*/*/index.vue'], { eager: true });
    this.componentSchemas = import.meta.glob('./../../ui-library/*/*/schema/*.ts', { eager: true });
  }
  install() {
    this.#install();
  }

  #uninstall() {
    this.components = {};
    this.#schemas = {};
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

    return schemas;
  }

  #getLibraryComponents(library_path: string): ComponentData[] {
    const components: ComponentData[] = [];

    for (const path of Object.keys(this.UILibraryComponentUses).filter(
      (key) => key && key.startsWith(library_path)
    )) {
      const component_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const component: UseUILibraryComponent = this.UILibraryComponentUses[path].default;
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
    this.UILibraryComponentUses = import.meta.glob('./../../ui-library/*/*/use.ts', {
      eager: true
    });
    this.UILibraryUses = import.meta.glob('./../../ui-library/*/use.ts', {
      eager: true
    });

    const children: ComponentData[] = [];
    for (const path of Object.keys(this.UILibraryUses)) {
      const library_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const library: UseUILibraryComponent = this.UILibraryUses[path].default;
      children.push({
        name: library.name,
        id: library.id,
        children: this.#getLibraryComponents(library_path)
      });
    }

    this.UILibraryUses = {};
    this.UILibraryComponentUses = {};
    return [
      {
        name: '本地',
        id: 'local',
        children: children
      }
    ];
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
      return this.#schemas;
    }

    return schemas;
  }

  #getComponentSchema(schema_path: string): ComponentSchemaExport {
    return this.componentSchemas[schema_path]?.default || {};
  }

  #getComponentPropsTypes(schema_path: string) {
    const schemas = this.#getSchemas();
    const componentSchemas = this.#getComponentSchema(schema_path);
    const propsTypes: SchemaPropsTypes = [];

    if (
      componentSchemas &&
      typeof componentSchemas === 'object' &&
      Array.isArray(componentSchemas.schemas)
    ) {
      componentSchemas.schemas
        .filter((schema) => schema && typeof schema === 'object' && !Array.isArray(schema))
        .forEach((component_schema) => {
          const schema = schemas[component_schema.schema];
          propsTypes.push({
            name: schema.name,
            label: schema.label,
            key: schema.key,
            //@ts-ignore
            schema: schema[component_schema.type]
          });
        });
    }
    return readonly(propsTypes);
  }
  getComponentPropsTypes(schema_path: string) {
    return this.#getComponentPropsTypes(schema_path);
  }

  #getComponentProps(schema_path: string): ComponentProps {
    const schemas = this.#getSchemas();
    const componentSchemas = this.#getComponentSchema(schema_path);
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

          const is_array_schema = schema_data && Array.isArray(schema_data);
          const is_object_schema =
            schema_data && !is_array_schema && typeof schema_data === 'object';

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

          if (component_schema_name) {
            const component_schema_default: ComponentProp = component_schema.default;
            if (is_object_schema) {
              Object.keys(schema_data).forEach((key) => {
                if (!key) {
                  console.warn(
                    'Schema Key of Editor is null',
                    'schema name=' + schema.name,
                    'component_schema type=' + component_schema.type
                  );
                  return;
                }
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
            } else if (is_array_schema) {
              schema_data.forEach((r_arr) => {
                Array.isArray(r_arr) &&
                  r_arr.forEach((item) => {
                    if (!item.key) {
                      console.warn(
                        'Schema Key of Editor is null',
                        'schema name=' + schema.name,
                        'component_schema type=' + component_schema.type
                      );
                      return;
                    }
                    if (is_component_schema_default_object) {
                      //@ts-ignore
                      prop[item.key] = component_schema_default[item.key] || item.default;
                    } else if (is_component_schema_default) {
                      //@ts-ignore
                      prop[item.key] = component_schema_default || item.default;
                    } else {
                      prop[item.key] = item.default;
                    }
                  });
              });
            }
          }

          schema && schema.key && (props[schema.key] = prop);
        });
    }
    return cloneDeep(props);
  }
  getComponentProps(schema_path: string) {
    return this.#getComponentProps(schema_path);
  }

  // formatter component prop is schema prop type
  formatterComponentProp(
    schema: SchemaKeyTypes,
    opts: { key: string; value: string | number | boolean | undefined | null; unit?: string }
  ): string | number | boolean | undefined | null {
    let value = opts.value;

    const is_array_schema = schema && Array.isArray(schema);
    const is_object_schema = schema && !is_array_schema && typeof schema === 'object';

    let schema_prop;
    if (is_object_schema) {
      schema_prop = schema[opts.key];
    } else if (is_array_schema) {
      schema_prop = schema.flatMap((arr) => arr).find((item) => item.key === opts.key);
    }

    if (schema_prop) {
      if (schema_prop.type === Number) {
        value = Number(value);
        isNaN(value) && (value = opts.value);
      } else if (schema_prop.type === String) {
        value = value + '';
      } else if (schema_prop.type === Boolean) {
        value = !!value;
      }
    }
    return value;
  }

  #getComponent(component_path: string) {
    return this.components[component_path];
  }

  createNodeComponent(props: ComponentProps | ComponentProps, component: string) {
    return createVNode(this.#getComponent(component), {
      data: props
    });
  }

  createNodeComponentApp(
    props: ComponentProps | ComponentProps,
    parentEl: HTMLElement | undefined,
    component: string
  ): App {
    return createComponent<{ data: ComponentProps }>(
      'component',
      parentEl,
      this.#getComponent(component),
      {
        data: props
      }
    );
  }
}

let myComponentContext: CreateComponentContext;

export const createComponentContext = function (): CreateComponentContext {
  myComponentContext = new CreateComponentContext();
  myComponentContext.install();
  onBeforeUnmount(() => {
    myComponentContext.uninstall();
  });
  return myComponentContext;
};

export const useComponentContext = function (): CreateComponentContext {
  return myComponentContext;
};
