interface IDefaultSchemaKeyData {
  key?: string;
  label?: string;
  icon?: string | string[];
  ctrl: string;
  ctrl_type?: string;
  size?: 'default' | 'small' | 'middle' | 'wide' | 'large' | 'mini';
  suffix?: string;
  hint?: string;
  options?: {
    label?: string | number;
    value: string | number;
    icon?: string;
  }[];
  keys?: string[];
  v_if?: string;
  click?: (
    props: ComponentProp
  ) =>
    | void
    | [key: string, value: ComponentPropValue]
    | Record<string, ComponentPropValue>;
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
  default: any[];
}

interface ISchemaKeyObjectData extends IDefaultSchemaKeyData {
  type: ObjectConstructor;
  default: Record<string, any>;
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

interface ISchemaSelectInputData extends IDefaultSchemaKeyData {
  type: ObjectConstructor;
  ctrl: 'C_SELECT_INPUT';
  keys: [string, string];
  default: Record<string, string | number>;
}

declare type SchemaKeyType =
  | ISchemaKeyNumberData
  | ISchemaKeyStringData
  | ISchemaKeyBooleanData
  | ISchemaArrayData
  | ISchemaKeyObjectData
  | ISchemaBlendData
  | ISchemaBlendsData
  | ISchemaSelectInputData;

declare type SchemaKeyTypes = SchemaKeyType[][] | { [key: string]: SchemaKeyType };

declare interface ISchemaExportDefault {
  name: string;
  label: string;
  key: string;
  show_switch?: boolean;
}

declare interface ISchemaExport extends ISchemaExportDefault {
  schema: SchemaKeyTypes;
  [key: string]: unknown;
}

declare type SchemaKeysTypes = ISchemaExport[];
