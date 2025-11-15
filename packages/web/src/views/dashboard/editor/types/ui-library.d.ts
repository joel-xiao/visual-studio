declare type ComponentProp = { [key: string]: number | string | number[] | boolean | undefined };

declare interface IComponentProps {
  [key: string]: ComponentProp;
}

declare interface ISchemaPropTypes extends ISchemaExportDefault {
  schema: SchemaKeyTypes;
}

declare type SchemaPropsTypes = ISchemaPropTypes[];

declare type CategorySchemaType = {
  name: string;
  icon: string;
  category: string;
  propsTypes: SchemaPropsTypes;
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

declare interface IUseUILibraryComponent {
  name: string;
  id: string;
}
