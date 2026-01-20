declare type ComponentPropValue = number | string | number[] | boolean | Record<string, unknown> | Record<string, unknown>[] | undefined;

declare type ComponentProp = { [key: string]: ComponentPropValue };

declare interface IComponentProps {
  [key: string]: ComponentProp;
}

declare interface ISchemaPropTypes extends ISchemaExportDefault {
  schema: SchemaKeyTypes;
  show_switch?: boolean;
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

declare type ComponentSchemaExportSchemas = {
  type: string;
  label?: string;
  key?: string;
  schema: string;
  default: ComponentProp;
  show_switch?: boolean;
}[];

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
