import { App, readonly, createVNode } from 'vue';
import { cloneDeep } from 'lodash';
import { createComponent } from '@hooks/vue-hooks';
import type { IComponentData } from './../../panels/components/panel-component/interface';
import type {
  ISchemaExport,
  SchemaKeyTypes,
  SchemaPropsTypes,
  CategorySchemaTypes,
  ComponentSchemaExportSchemas,
  IComponentSchemaExport,
  ComponentProp,
  IComponentProps,
  IUseUILibraryComponent
} from './interface';

export class CreateComponentContext {
  UILibraryUses: Record<string, { [key: string]: IUseUILibraryComponent }>;
  UILibraryComponentUses: Record<string, { [key: string]: IUseUILibraryComponent }>;

  #schemas: { [key: string]: ISchemaExport };
  containerSchemas: Record<string, { [key: string]: IComponentSchemaExport }>;
  componentSchemas: Record<string, { [key: string]: IComponentSchemaExport }>;
  components: Record<string, { [key: string]: App }>;
  constructor() {
    this.UILibraryUses = {};
    this.UILibraryComponentUses = {};

    this.#schemas = {};

    this.containerSchemas = {};
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
      import.meta.glob<ISchemaExport>(['./../../schema/**/*.ts', '!./../../schema/**/*.d.ts'], {
        eager: true,
        import: 'default'
      })
    ).forEach((schema) => {
      schema && (this.#schemas[schema.name] = schema);
    });

    this.components = import.meta.glob(['./../../ui-library/*/*/index.vue'], {
      eager: true,
      import: 'default'
    });

    this.containerSchemas = import.meta.glob('./../../container/schema/*.ts', { eager: true });

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
    return `/image/dashboard/editor/${icon}`;
  }

  #getComponentSchemas(component_path: string): IComponentData[] {
    const schemas: IComponentData[] = [];

    for (const path of Object.keys(this.componentSchemas).filter(
      (key) => key && key.startsWith(component_path)
    )) {
      const component_path = path.substring(0, path.lastIndexOf('/schema/') + 1);
      const schema: IComponentSchemaExport = this.componentSchemas[path].default;
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

  #getLibraryComponents(library_path: string): IComponentData[] {
    const components: IComponentData[] = [];

    for (const path of Object.keys(this.UILibraryComponentUses).filter(
      (key) => key && key.startsWith(library_path)
    )) {
      const component_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const component: IUseUILibraryComponent = this.UILibraryComponentUses[path].default;
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

  getUiLibrary(): IComponentData[] {
    this.UILibraryComponentUses = import.meta.glob('./../../ui-library/*/*/use.ts', {
      eager: true
    });
    this.UILibraryUses = import.meta.glob('./../../ui-library/*/use.ts', {
      eager: true
    });

    const children: IComponentData[] = [];
    for (const path of Object.keys(this.UILibraryUses)) {
      const library_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const library: IUseUILibraryComponent = this.UILibraryUses[path].default;
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

  #getSchemas(schema_names?: string | string[]): { [key: string]: ISchemaExport } {
    const schemas: { [key: string]: ISchemaExport } = {};

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

  #getComponentSchema(schema_path: string): IComponentSchemaExport {
    return (
      this.containerSchemas[schema_path]?.default ||
      this.componentSchemas[schema_path]?.default ||
      {} as IComponentSchemaExport
    );
  }

  #parseSchema(exportSchemas: ComponentSchemaExportSchemas ) {
    const schemas = this.#getSchemas();
    const propsTypes: SchemaPropsTypes = [];
    if (Array.isArray(exportSchemas)) {
      exportSchemas
        .filter((schema) => schema && typeof schema === 'object' && !Array.isArray(schema))
        .forEach((component_schema) => {
          const schema = schemas[component_schema.schema];
          propsTypes.push({
            name: schema.name,
            label: schema.label,
            key: schema.key,
            // @ts-ignore
            schema: schema[component_schema.type]
          });
        });
    }

    return propsTypes;
  }

  #getComponentPropsTypes(schema_path: string) {
    const componentSchemas = this.#getComponentSchema(schema_path);
    const isSchemaObject =  componentSchemas && typeof componentSchemas === 'object';
    
    let propsTypes: SchemaPropsTypes = [];
    if (isSchemaObject){
      propsTypes = this.#parseSchema(componentSchemas.schemas);
    }

    let categorySchemas: CategorySchemaTypes = []
    if (isSchemaObject){
      if (Array.isArray(componentSchemas.categorySchemas)) {
        for (let category of componentSchemas.categorySchemas) {
          categorySchemas.push({
            name: category.name,
            icon: category.icon,
            category: category.category,
            propsTypes: this.#parseSchema(category.schemas)
          });
        }
      }
    }
    
    return readonly({
      propsTypes,
      categorySchemas,
    });
  }
  getComponentPropsTypes(schema_path: string) {
    return this.#getComponentPropsTypes(schema_path);
  }

  #getComponentProps(schema_path: string): IComponentProps {
    const schemas = this.#getSchemas();
    const componentSchemas = this.#getComponentSchema(schema_path);
    const props: IComponentProps = {};
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
                    'Schema 1',
                    'Schema Key of Editor is null',
                    'schema name = ' + schema.name,
                    'component_schema type = ' + component_schema.type,
                    schema_data
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
                        'Schema 2',
                        'Schema Key of Editor is null',
                        'schema name = ' + schema.name,
                        'component_schema type = ' + component_schema.type,
                        item
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
    opts: { key: string; value: number | string | boolean | undefined | number[]; unit?: string }
  ): number | string | boolean | undefined | number[] {
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

  createNodeComponent(props: IComponentProps, component: string) {
    return createVNode(this.#getComponent(component), {
      data: props
    });
  }

  createNodeComponentApp(
    props: IComponentProps | IComponentProps,
    parentEl: HTMLElement | undefined,
    component: string
  ): App {
    return createComponent<{ data: IComponentProps }>(
      'component',
      parentEl,
      this.#getComponent(component),
      {
        data: props
      }
    );
  }
}

let myComponentContext: CreateComponentContext | undefined;
export const createComponentContext = function () {
  if (!myComponentContext) {
    myComponentContext = new CreateComponentContext();
    myComponentContext.install();
  }
  return myComponentContext;
};

export const removeComponentContext = function () {
  myComponentContext?.uninstall();
  myComponentContext = undefined;
};

export const useComponentContext = function () {
  myComponentContext = createComponentContext();
  return myComponentContext;
};
