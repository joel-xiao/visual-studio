declare type ComponentPropValue = number | string | number[] | string[] | boolean | Record<string, unknown> | Record<string, unknown>[] | undefined;

declare type ComponentProp = { [key: string]: ComponentPropValue };

declare interface IComponentProps {
  [key: string]: ComponentProp;
}

declare interface ISchemaPropTypes extends ISchemaExportDefault {
  schema: SchemaKeyTypes;
  show_switch?: boolean;
  effectSchema?: string;           // 统一命名：效果 schema 引用（schema 名称）
  schemas?: ISchemaPropTypes[];    // 嵌套 schemas，传递给子组件使用
}

declare type SchemaPropsTypes = ISchemaPropTypes[];

declare type SchemaTabType = {
  name: string;
  tab: string;
  propsTypes: SchemaPropsTypes;
};

declare type CategorySchemaType = {
  name: string;
  icon: string;
  category: string;
  propsTypes: SchemaPropsTypes;
  schemasTabs?: SchemaTabType[];
};

declare type CategorySchemaTypes = CategorySchemaType[];


declare type ComponentPropsTypes = {
  propsTypes: SchemaTypes;
  CategorySchemasTypes: CategorySchemaTypes;
};

declare type ComponentSchemaExportSchema = {
  type: string;                    // schema 属性名（如 'schema'、'conditionsSchema'）
  label?: string;
  key?: string;
  schema: string;                  // schema 名称（必须）
  default?: ComponentProp;
  show_switch?: boolean;
  schemas?: ComponentSchemaExportSchema[];  // 嵌套 schemas，传递给子组件使用
};

declare type ComponentSchemaExportSchemas = ComponentSchemaExportSchema[];

declare interface IComponentSchemaExport {
  name: string;
  type: string;
  icon: string;
  schemas: ComponentSchemaExportSchemas;

  categorySchemas?: {
    name: string;
    icon: string;
    category: string;

    schemasTabs?: {
      name: string;
      tab: string;

      schemas: ComponentSchemaExportSchemas;
    }[];

    schemas: ComponentSchemaExportSchemas;
  }[];
}

declare interface IUseMaterialComponent {
  name: string;
  id: string;
}
