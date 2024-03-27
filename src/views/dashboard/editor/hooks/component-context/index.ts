import { App, readonly, createVNode } from 'vue';
import { cloneDeep } from 'lodash';
import { createComponent } from '@hooks/vue-hooks';

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

  #getComponentSchemas(component_path: string): PanelComponentData[] {
    const schemas: PanelComponentData[] = [];

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

  #getLibraryComponents(library_path: string): PanelComponentData[] {
    const components: PanelComponentData[] = [];

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

  getUiLibrary(): PanelComponentData[] {
    this.UILibraryComponentUses = import.meta.glob('./../../ui-library/*/*/use.ts', {
      eager: true
    });
    this.UILibraryUses = import.meta.glob('./../../ui-library/*/use.ts', {
      eager: true
    });

    const children: PanelComponentData[] = [];
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
      for (const component_schema of exportSchemas) {
        if (component_schema && typeof component_schema === 'object' && !Array.isArray(component_schema)) {
          const schema = schemas[component_schema.schema];
          propsTypes.push({
            name: schema.name,
            label: component_schema.label || schema.label,
            key: component_schema.key || schema.key,
            // @ts-ignore
            schema: schema[component_schema.type]
          });
        }
      }
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

  #parseSchemaProp(exportSchemas: ComponentSchemaExportSchemas ) {
    const schemas = this.#getSchemas();
    const props: IComponentProps = {};

    if (Array.isArray(exportSchemas)) {
      for (const component_schema of exportSchemas) {

        if (component_schema && typeof component_schema === 'object' && !Array.isArray(component_schema)) {
          const schema = schemas[component_schema.schema];
           //@ts-ignore
          const schema_data: SchemaKeyTypes | null = !Array.isArray(schema) && typeof schema === 'object' ? schema[component_schema.type] : null;

          const is_component_schema = !!component_schema.schema;
          const is_array_schema = schema_data && Array.isArray(schema_data);
          const is_component_schema_default = !!component_schema.default;
          const is_component_schema_default_object = is_component_schema_default && !Array.isArray(component_schema.default) && typeof component_schema.default === 'object';

          const prop: ComponentProp = {};

          if (is_component_schema) {
            const component_schema_default: ComponentProp = component_schema.default;

            if (is_array_schema) {
              for (const row_array of schema_data) {

                if (Array.isArray(row_array)) {
                  for (const item of row_array) {

                    if (!item.key) {
                      console.warn(
                        'Schema 2',
                        'Schema Key of Editor is null',
                        'schema name = ' + schema.name,
                        'component_schema type = ' + component_schema.type,
                        item
                      );
                      continue;
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
                  }
                }
              }
            }
          }

          props[component_schema.key || schema.key] = prop;
        }
      }
    }

    return props;
  }

  #getComponentProps(schema_path: string): IComponentProps {
    const schemas = this.#getSchemas();
    const componentSchemas = this.#getComponentSchema(schema_path);
    const isSchemaObject = componentSchemas && typeof componentSchemas === 'object';

    const props: IComponentProps = {};

    if (isSchemaObject){
      const result = this.#parseSchemaProp(componentSchemas.schemas);
      for ( const key of Object.keys(result)) {
        props[key] = result[key];
      }
    }

    if (isSchemaObject){
      if (Array.isArray(componentSchemas.categorySchemas)) {
        for (let category of componentSchemas.categorySchemas) {
          const result = this.#parseSchemaProp(category.schemas);
          for ( const key of Object.keys(result)) {
            props[key] = result[key];
          }
        }
      }
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
