import type { PanelSchemaLayout } from '../../panels/components/panel-schema/layout/interface';

interface defaultSchemaKeyData {
  label?: string;
  icon?: string;
  required: boolean;
}

interface SchemaKeyNumberData extends defaultSchemaKeyData {
  type: NumberConstructor;
  default: number;
}

interface SchemaKeyStringData extends defaultSchemaKeyData {
  type: StringConstructor;
  default: number;
}

interface SchemaKeyBooleanData extends defaultSchemaKeyData {
  type: BooleanConstructor;
  default: boolean;
}

interface SchemaArrayData extends defaultSchemaKeyData {
  type: ArrayConstructor;
  default: number[];
}

export interface SchemaKeyTypes {
  [key: string]: SchemaKeyNumberData | SchemaKeyStringData | SchemaKeyBooleanData | SchemaArrayData;
}
export interface SchemaKeysTypes {
  [key: string]: SchemaTypes;
}
export interface SchemaExport {
  name: string;
  label: string;
  key: string;
  schema: SchemaKeyTypes;
}

export interface ComponentSchemaExport {
  name: string;
  type: string;
  icon: string;
  schemas: {
    type: string;
    schema: string;
    required: boolean;
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
