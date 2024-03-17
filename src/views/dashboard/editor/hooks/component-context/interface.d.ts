// import type { PanelSchemaLayout } from '../../panels/components/panel-schema/layout/interface';
// | PanelSchemaLayout
export type ComponentProp = { [key: string]: number | string | number[] | boolean | undefined };

export interface ComponentProps {
  [key: string]: ComponentProp;
}

interface defaultSchemaKeyData {
  key?: string;
  label?: string;
  icon?: string;
  ctrl: string;
  ctrl_type?: string;
  size?: 'default' | 'small' | 'large' | 'largely' | 'right';
  click?: (props: ComponentProp) => void;
  change?: (props: ComponentProp) => void;
}

interface SchemaKeyNumberData extends defaultSchemaKeyData {
  type: NumberConstructor;
  default: number;
}

interface SchemaKeyStringData extends defaultSchemaKeyData {
  type: StringConstructor;
  default: string;
}

interface SchemaKeyBooleanData extends defaultSchemaKeyData {
  type: BooleanConstructor;
  default: boolean;
}

interface SchemaArrayData extends defaultSchemaKeyData {
  type: ArrayConstructor;
  icon?: string | string[];
  default: number[];
}

interface SchemaFunctionData extends defaultSchemaKeyData {
  type: FunctionConstructor;
  default: () => void;
}

export type SchemaKeyType =
  | SchemaKeyNumberData
  | SchemaKeyStringData
  | SchemaKeyBooleanData
  | SchemaArrayData;

export type SchemaKeyTypes = { [key: string]: SchemaKeyType } | SchemaKeyType[][];

export interface SchemaExportDefault {
  name: string;
  label: string;
  key: string;
}
export interface SchemaExport extends SchemaExportDefault {
  schema: SchemaKeyTypes;
}

export type SchemaKeysTypes = SchemaExport[];

export interface SchemaPropTypes extends SchemaExportDefault {
  schema: SchemaKeyTypes;
}
export type SchemaPropsTypes = SchemaPropTypes[];

export interface ComponentSchemaExport {
  name: string;
  type: string;
  icon: string;

  schemas: {
    type: string;
    schema: string;
    default: ComponentProp;
  }[];

  categorySchemas?: {
    name: string;
    icon: string;
    category: string;

    schemasTabs?: {
      name: string;
      tab: string;

      schemas: {
        type: string;
        schema: string;
        default: ComponentProp;
      }[];
    }[];

    schemas?: {
      type: string;
      schema: string;
      default: ComponentProp;
    }[];
  }[];
}

export interface UseUILibraryComponent {
  name: string;
  id: string;
}
