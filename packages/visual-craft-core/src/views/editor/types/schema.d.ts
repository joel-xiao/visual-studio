interface IDefaultSchemaKeyData {
  key?: string;
  label?: string;
  icon?: string;
  ctrl: string;
  ctrl_type?: string;
  size?: 'default' | 'small' | 'middle' | 'large' | 'mini';
  options?: { label: string | number; value: string | number }[];
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

declare interface BlendType {
  mix: string;
  opacity: number | string;
  visible: boolean;
}

interface ISchemaBlendData extends IDefaultSchemaKeyData {
  type: ObjectConstructor;
  ctrl: 'C_BLEND';
  default: BlendType;
}

interface ISchemaBlendsData extends IDefaultSchemaKeyData {
  type: ArrayConstructor;
  ctrl: 'BLENDS';
  default: BlendType[];
}
interface ISchemaFunctionData extends IDefaultSchemaKeyData {
  type: FunctionConstructor;
  default: () => void;
}

declare type SchemaKeyType =
  | ISchemaKeyNumberData
  | ISchemaKeyStringData
  | ISchemaKeyBooleanData
  | ISchemaArrayData
  | ISchemaBlendData
  | ISchemaBlendsData;

declare type SchemaKeyTypes = { [key: string]: SchemaKeyType } | SchemaKeyType[][];

declare interface ISchemaExportDefault {
  name: string;
  label: string;
  key: string;
}

declare interface ISchemaExport extends ISchemaExportDefault {
  schema: SchemaKeyTypes;
  [key: string]: unknown;
}

declare type SchemaKeysTypes = ISchemaExport[];
