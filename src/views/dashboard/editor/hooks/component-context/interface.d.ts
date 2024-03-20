// import type { PanelSchemaLayout } from '../../panels/components/panel-schema/layout/interface';
// | PanelSchemaLayout
export type ComponentProp = { [key: string]: number | string | number[] | boolean | undefined };

export interface IComponentProps {
  [key: string]: ComponentProp;
}

interface IDefaultSchemaKeyData {
  key?: string;
  label?: string;
  icon?: string;
  ctrl: string;
  ctrl_type?: string;
  size?: 'default' | 'small' | 'large' | 'largely' | 'right';
  click?: (props: ComponentProp) => void;
  change?: (props: ComponentProp) => void;
}

interface ISchemaKeyNumberData extends IDefaultSchemaKeyData {
  type: NumberConstructor;
  default: number;
}

interface ISchemaKeyStringData extends IDefaultSchemaKeyData {
  type: StringConstructor;
  default: string;
}

interface ISchemaKeyBooleanData extends IDefaultSchemaKeyData {
  type: BooleanConstructor;
  default: boolean;
}

interface ISchemaArrayData extends IDefaultSchemaKeyData {
  type: ArrayConstructor;
  icon?: string | string[];
  default: number[];
}

interface ISchemaFunctionData extends IDefaultSchemaKeyData {
  type: FunctionConstructor;
  default: () => void;
}

export type SchemaKeyType =
  | ISchemaKeyNumberData
  | ISchemaKeyStringData
  | ISchemaKeyBooleanData
  | ISchemaArrayData;

export type SchemaKeyTypes = { [key: string]: SchemaKeyType } | SchemaKeyType[][];

export interface ISchemaExportDefault {
  name: string;
  label: string;
  key: string;
}
export interface ISchemaExport extends ISchemaExportDefault {
  schema: SchemaKeyTypes;
}

export type SchemaKeysTypes = ISchemaExport[];

export interface ISchemaPropTypes extends ISchemaExportDefault {
  schema: SchemaKeyTypes;
}
export type SchemaPropsTypes = ISchemaPropTypes[];

export type CategorySchemaTypes = {
  name: string;
  icon: string;
  category: string;
  propsTypes: SchemaPropsTypes,
}[];

export type ComponentPropsTypes = {
  propsTypes: SchemaTypes,
  CategorySchemasTypes: CategorySchemaTypes,
}

export interface IComponentSchemaExportSchemas  {
  type: string;
  schema: string;
  default: ComponentProp;
}[];

export interface ICategorySchemas {
  name: string;
  icon: string;
  category: string;
};

export interface IComponentSchemaExport {
  name: string;
  type: string;
  icon: string;
  schemas: IComponentSchemaExportSchemas;

  categorySchemas?: {
    name: string;
    icon: string;
    category: string;

    schemasTabs?: {
      name: string;
      tab: string;

      schemas: IComponentSchemaExportSchemas;
    }[];

    schemas: IComponentSchemaExportSchemas;
  }[];
}

export interface IUseUILibraryComponent {
  name: string;
  id: string;
}
