import { readonly, createVNode, type Component as VueComponent } from 'vue';
import { cloneDeep, get, set } from 'lodash';
import { createComponent } from '../../../../hooks/vue-hooks';
import { getEditorIcon } from 'virtual:visual-craft-core-public-assets';

type ComponentRegistry = Record<string, VueComponent>;
type ComponentSchemaRegistry = Record<string, IComponentSchemaExport>;

export class CreateComponentContext {
  MaterialUses: Record<string, { [key: string]: IUseMaterialComponent }>;
  MaterialComponentUses: Record<string, { [key: string]: IUseMaterialComponent }>;

  #schemas: Record<string, ISchemaExport>;
  #canvasSchemas: ComponentSchemaRegistry;
  #componentSchemas: ComponentSchemaRegistry;
  #components: ComponentRegistry;
  #componentPathMap: Record<string, string>;

  constructor() {
    this.MaterialUses = {};
    this.MaterialComponentUses = {};

    this.#schemas = {};
    this.#canvasSchemas = {};
    this.#componentSchemas = {};
    this.#components = {};
    this.#componentPathMap = {};

    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);

    this.getMaterials = this.getMaterials.bind(this);

    this.getComponentProps = this.getComponentProps.bind(this);
    this.formatterComponentProp = this.formatterComponentProp.bind(this);
    this.getComponentPropsTypes = this.getComponentPropsTypes.bind(this);
    this.createNodeComponent = this.createNodeComponent.bind(this);
    this.createNodeComponentApp = this.createNodeComponentApp.bind(this);
    this.getAvailableComponents = this.getAvailableComponents.bind(this);
    this.getComponentIcon = this.getComponentIcon.bind(this);
  }

  #install() {
    Object.values(
      import.meta.glob<ISchemaExport>(['./../../schema/**/*.ts', '!./../../schema/**/*.d.ts'], {
        eager: true,
        import: 'default'
      })
    ).forEach(schema => {
      if (schema?.name) {
        this.#schemas[schema.name] = schema;
      }
    });

    const rawCanvasSchemas = import.meta.glob<{ default: IComponentSchemaExport }>(
      './../../canvas/schema/*.ts',
      { eager: true }
    );
    for (const [, module] of Object.entries(rawCanvasSchemas)) {
      const schema = module.default;
      if (schema?.type) {
        this.#canvasSchemas[schema.type] = schema;
      }
    }

    const rawComponentSchemas = import.meta.glob<{ default: IComponentSchemaExport }>(
      './../../materials/*/*/schema/*.ts',
      { eager: true }
    );

    const rawComponents = import.meta.glob<VueComponent>(
      ['./../../materials/*/*/index.vue'],
      { eager: true, import: 'default' }
    );

    for (const [schemaPath, module] of Object.entries(rawComponentSchemas)) {
      const schema = module.default;
      if (schema?.type) {
        const componentPath = schemaPath
          .substring(0, schemaPath.lastIndexOf('/schema/'))
          .concat('/index.vue');

        this.#componentSchemas[schema.type] = schema;
        this.#componentPathMap[schema.type] = componentPath;

        if (rawComponents[componentPath]) {
          this.#components[schema.type] = rawComponents[componentPath];
        }
      }
    }
  }

  install() {
    this.#install();
  }

  #uninstall() {
    this.#components = {};
    this.#schemas = {};
    this.#componentSchemas = {};
    this.#canvasSchemas = {};
    this.#componentPathMap = {};
  }

  uninstall() {
    this.#uninstall();
  }

  #getIcon(icon: string): string {
    if (!icon) return '';

    if (
      icon.startsWith('http://') ||
      icon.startsWith('https://') ||
      icon.startsWith('data:') ||
      icon.startsWith('/')
    ) {
      return icon;
    }

    return getEditorIcon(icon);
  }

  #getComponentSchemas(component_path: string): PanelComponentData[] {
    const schemas: PanelComponentData[] = [];

    for (const [schemaType, componentPath] of Object.entries(this.#componentPathMap)) {
      if (componentPath.startsWith(component_path.replace('/use.ts', ''))) {
        const schema = this.#componentSchemas[schemaType];
        if (schema) {
          schemas.push({
            name: schema.name,
            id: schema.type,
            icon: this.#getIcon(schema.icon),
            data: {
              name: schema.name,
              component: schemaType,
              schema: schemaType
            }
          });
        }
      }
    }

    return schemas;
  }

  #getLibraryComponents(library_path: string): PanelComponentData[] {
    const components: PanelComponentData[] = [];

    for (const path of Object.keys(this.MaterialComponentUses).filter(
      key => key && key.startsWith(library_path)
    )) {
      const component_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const component: IUseMaterialComponent = this.MaterialComponentUses[path].default;
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

  getMaterials(): PanelComponentData[] {
    this.MaterialComponentUses = import.meta.glob('./../../materials/*/*/use.ts', {
      eager: true
    });
    this.MaterialUses = import.meta.glob('./../../materials/*/use.ts', {
      eager: true
    });

    const children: PanelComponentData[] = [];
    for (const path of Object.keys(this.MaterialUses)) {
      const library_path = path.substring(0, path.lastIndexOf('/use.ts') + 1);
      const library: IUseMaterialComponent = this.MaterialUses[path].default;
      children.push({
        name: library.name,
        id: library.id,
        children: this.#getLibraryComponents(library_path)
      });
    }

    this.MaterialUses = {};
    this.MaterialComponentUses = {};
    return [
      {
        name: '本地',
        id: 'local',
        children: children
      }
    ];
  }

  #getSchemas(schema_names?: string | string[]): Record<string, ISchemaExport> {
    if (typeof schema_names === 'string') {
      return { [schema_names]: this.#schemas[schema_names] };
    } else if (Array.isArray(schema_names)) {
      const schemas: Record<string, ISchemaExport> = {};
      schema_names.forEach(name => {
        schemas[name] = this.#schemas[name];
      });
      return schemas;
    }
    return this.#schemas;
  }

  #getComponentSchema(schemaType: string): IComponentSchemaExport {
    return (
      this.#canvasSchemas[schemaType] ||
      this.#componentSchemas[schemaType] ||
      ({} as IComponentSchemaExport)
    );
  }

  getComponentIcon(schemaType: string): string {
    const schema = this.#getComponentSchema(schemaType);
    return schema?.icon ? this.#getIcon(schema.icon) : '';
  }

  getAvailableComponents(): Array<{ type: string; name: string; category: 'canvas' | 'chart' }> {
    const components: Array<{ type: string; name: string; category: 'canvas' | 'chart' }> = [];

    // Canvas schemas (e.g., CANVAS_ROOT)
    for (const [type, schema] of Object.entries(this.#canvasSchemas)) {
      components.push({
        type,
        name: schema.name || type,
        category: 'canvas'
      });
    }

    // Component schemas (e.g., APACHE_ECHARTS_BAR_SIMPLE)
    for (const [type, schema] of Object.entries(this.#componentSchemas)) {
      components.push({
        type,
        name: schema.name || type,
        category: 'chart'
      });
    }

    return components;
  }

  #parseSchema(exportSchemas: ComponentSchemaExportSchemas) {
    const schemas = this.#getSchemas();
    const propsTypes: SchemaPropsTypes = [];
    if (Array.isArray(exportSchemas)) {
      for (const component_schema of exportSchemas) {
        if (
          component_schema &&
          typeof component_schema === 'object' &&
          !Array.isArray(component_schema)
        ) {
          const schema = schemas[component_schema.schema];
          propsTypes.push({
            name: schema.name,
            label: component_schema.label || schema.label,
            key: component_schema.key || schema.key,
            schema: (schema as Record<string, unknown>)[component_schema.type] as SchemaKeyTypes
          });
        }
      }
    }

    return propsTypes;
  }

  #getComponentPropsTypes(schema_path: string) {
    const componentSchemas = this.#getComponentSchema(schema_path);
    const isSchemaObject = componentSchemas && typeof componentSchemas === 'object';

    let propsTypes: SchemaPropsTypes = [];
    if (isSchemaObject) {
      propsTypes = this.#parseSchema(componentSchemas.schemas);
    }

    const categorySchemas: CategorySchemaTypes = [];
    if (isSchemaObject) {
      if (Array.isArray(componentSchemas.categorySchemas)) {
        for (const category of componentSchemas.categorySchemas) {
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
      categorySchemas
    });
  }
  getComponentPropsTypes(schema_path: string) {
    return this.#getComponentPropsTypes(schema_path);
  }

  #parseSchemaProp(exportSchemas: ComponentSchemaExportSchemas) {
    const schemas = this.#getSchemas();
    const props: IComponentProps = {};

    if (Array.isArray(exportSchemas)) {
      for (const component_schema of exportSchemas) {
        if (
          component_schema &&
          typeof component_schema === 'object' &&
          !Array.isArray(component_schema)
        ) {
          const schema = schemas[component_schema.schema];
          const schema_data: SchemaKeyTypes | null =
            !Array.isArray(schema) && typeof schema === 'object'
              ? (schema as Record<string, unknown>)[component_schema.type] as SchemaKeyTypes | undefined ?? null
              : null;

          const is_component_schema = !!component_schema.schema;
          const is_array_schema = schema_data && Array.isArray(schema_data);
          const is_component_schema_default = !!component_schema.default;
          const is_component_schema_default_object =
            is_component_schema_default &&
            !Array.isArray(component_schema.default) &&
            typeof component_schema.default === 'object';

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
                      const value = get(component_schema_default, item.key) ?? item.default;
                      set(prop, item.key, value);
                    } else if (is_component_schema_default) {
                      set(prop, item.key, component_schema_default || item.default);
                    } else {
                      set(prop, item.key, item.default);
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
    this.#getSchemas();
    const componentSchemas = this.#getComponentSchema(schema_path);
    const isSchemaObject = componentSchemas && typeof componentSchemas === 'object';

    const props: IComponentProps = {};

    if (isSchemaObject) {
      const result = this.#parseSchemaProp(componentSchemas.schemas);
      for (const key of Object.keys(result)) {
        props[key] = result[key];
      }
    }

    if (isSchemaObject) {
      if (Array.isArray(componentSchemas.categorySchemas)) {
        for (const category of componentSchemas.categorySchemas) {
          const result = this.#parseSchemaProp(category.schemas);
          for (const key of Object.keys(result)) {
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
      schema_prop = schema.flatMap(arr => arr).find(item => item.key === opts.key);
    }

    if (schema_prop) {
      if (schema_prop.type === Number) {
        value = Number(value);
        if (isNaN(value)) {
          value = opts.value;
        }
      } else if (schema_prop.type === String) {
        value = value + '';
      } else if (schema_prop.type === Boolean) {
        value = !!value;
      }
    }
    return value;
  }

  #getComponent(schemaType: string): VueComponent | undefined {
    return this.#components[schemaType];
  }

  createNodeComponent(props: IComponentProps, component: string) {
    const comp = this.#getComponent(component);
    if (!comp) {
      console.warn(`[ComponentContext] Component not found: ${component}`);
      return null;
    }
    return createVNode(comp, {
      data: props
    });
  }

  createNodeComponentApp(
    props: IComponentProps | IComponentProps,
    parentEl: HTMLElement | undefined,
    component: string
  ) {
    const comp = this.#getComponent(component);
    if (!comp) {
      console.warn(`[ComponentContext] Component not found: ${component}`);
      return null;
    }
    return createComponent<{ config: IComponentProps }>(
      'component',
      parentEl,
      comp,
      {
        config: props
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
