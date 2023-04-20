import type { PanelSchemaLayout } from '../../panels/components/panel-schema/layout/interface';

interface defaultSchemaKeyData {
  key?: string;
  label?: string;
  icon?: string;
  ctrl: string;
  ctrl_type?: string;
  size?: string;
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
  default: number[];
}

interface SchemaFunctionData extends defaultSchemaKeyData {
  type: FunctionConstructor;
  default: () => void;
}

export type SchemaKeyTypes =
  | {
      [key: string]:
        | SchemaKeyNumberData
        | SchemaKeyStringData
        | SchemaKeyBooleanData
        | SchemaArrayData
        | SchemaFunctionData;
    }
  | (
      | SchemaKeyNumberData
      | SchemaKeyStringData
      | SchemaKeyBooleanData
      | SchemaArrayData
      | SchemaFunctionData
    )[][];

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
    default: PanelSchemaLayout;
  }[];
}

export type ComponentProp =
  | PanelSchemaLayout
  | { [key: string]: number | string | number[] | boolean | undefined };

export interface ComponentProps {
  [key: string]: ComponentProp;
}

export interface UseUILibraryComponent {
  name: string;
  id: string;
}
