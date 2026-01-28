declare type ComponentPropValue = number | string | number[] | boolean | Record<string, unknown> | Record<string, unknown>[] | undefined;
declare type ComponentProp = { [key: string]: ComponentPropValue };

declare interface IDefaultSchemaKeyData {
  key: string;
  ctrl: string;
  label?: string | number;
  v_if?: string;
  icon?: string | string[];
  hint?: string | string[];
  size?: 'default' | 'small' | 'middle' | 'wide' | 'large' | 'mini' | string;
  click?: (
    props: ComponentProp
  ) =>
    | void
    | [string, ComponentPropValue]
    | Record<string, ComponentPropValue>;
  change?: (props: ComponentProp) => void;
}

declare interface ISchemaInputData extends IDefaultSchemaKeyData {
  ctrl: 'C_INPUT';
  type: NumberConstructor | StringConstructor;
  default: number | string;
  suffix?: string;
  ctrl_type?: string;
}

declare interface ISchemaSelectData extends IDefaultSchemaKeyData {
  ctrl: 'C_SELECT';
  type: StringConstructor | NumberConstructor;
  default: string | number;
  ctrl_type?: string;
  options?: {
    label?: string | number;
    value: string | number;
    icon?: string;
    hint?: string;
  }[];
}

declare interface ISchemaColorPickerData extends IDefaultSchemaKeyData {
  ctrl: 'C_COLOR_PICKER';
  type: StringConstructor;
  default: string;
  ctrl_type?: string;
}

declare interface ISchemaGroupCheckData extends IDefaultSchemaKeyData {
  ctrl: 'C_GROUP_CHECK';
  type: ArrayConstructor;
  default: unknown[];
  options?: {
    label?: string | number;
    value: string | number;
    icon?: string;
    hint?: string;
  }[];
}

declare interface ISchemaCompoundInputData extends IDefaultSchemaKeyData {
  ctrl: 'C_COMPOUND_INPUT';
  type: ObjectConstructor | ArrayConstructor;
  default: Record<string, unknown> | unknown[];
  keys?: string[];
  suffix?: string;
}

declare interface ISchemaStrokeData extends IDefaultSchemaKeyData {
  ctrl: 'C_STROKE';
  type: ObjectConstructor;
  default: {
    show?: boolean;
    lineStyle?: {
      color?: string;
      width?: number;
      type?: string;
    };
    color?: string;
    width?: number;
    type?: string;
  } | Record<string, unknown>;
  keys?: string[];
  suffix?: string;
  options?: {
    label?: string | number;
    value: string | number;
    icon?: string;
    hint?: string;
  }[];
}

declare interface ISchemaGroupSelectData extends IDefaultSchemaKeyData {
  ctrl: 'C_GROUP_SELECT';
  type: StringConstructor | NumberConstructor;
  default: string | number;
  options?: {
    label?: string | number;
    value: string | number;
    icon?: string;
    hint?: string;
  }[];
}

declare interface ISchemaButtonData extends IDefaultSchemaKeyData {
  ctrl: 'C_BUTTON';
  type: BooleanConstructor;
  default: boolean;
  ctrl_type?: string;
}

declare interface ISchemaInputGroupData extends IDefaultSchemaKeyData {
  ctrl: 'INPUT_GROUP';
  type: ArrayConstructor;
  default: unknown[];
}

declare interface ISchemaEdgeData extends IDefaultSchemaKeyData {
  ctrl: 'C_EDGE';
  type: ArrayConstructor;
  default: number[];
}

declare interface ISchemaCodeEditorData extends IDefaultSchemaKeyData {
  ctrl: 'C_CODE_EDITOR';
  type: StringConstructor;
  default: string;
}

declare interface ISchemaPositionData extends IDefaultSchemaKeyData {
  ctrl: 'C_POSITION';
  type: StringConstructor;
  default: string;
}

declare interface ISchemaKeyNumberData extends IDefaultSchemaKeyData {
  ctrl: 'C_INPUT';
  type: NumberConstructor;
  default: number;
}

declare interface ISchemaKeyStringData extends IDefaultSchemaKeyData {
  ctrl: 'C_INPUT';
  type: StringConstructor;
  default: string;
}

declare interface ISchemaKeyBooleanData extends IDefaultSchemaKeyData {
  ctrl: 'C_SWITCH';
  type: BooleanConstructor;
  default: boolean;
}

declare interface ISchemaArrayData extends IDefaultSchemaKeyData {
  ctrl: string;
  type: ArrayConstructor;
  default: unknown[];
  options?: {
    label?: string | number;
    value: string | number;
    icon?: string;
    hint?: string;
  }[];
}

declare interface ISchemaKeyObjectData extends IDefaultSchemaKeyData {
  ctrl: string;
  type: ObjectConstructor;
  default: Record<string, unknown>;
}

declare interface BlendType {
  mix: string;
  opacity: number | string;
  visible: boolean;
}

declare interface ISchemaBlendData extends IDefaultSchemaKeyData {
  ctrl: 'C_BLEND';
  type: ObjectConstructor;
  default: BlendType;
}

declare interface ISchemaBlendsData extends IDefaultSchemaKeyData {
  ctrl: 'BLENDS';
  type: ArrayConstructor;
  default: BlendType[];
}

declare interface ISchemaFunctionData extends IDefaultSchemaKeyData {
  ctrl: string;
  type: FunctionConstructor;
  default: () => void;
}

declare interface ISchemaSelectInputData extends IDefaultSchemaKeyData {
  ctrl: 'C_SELECT_INPUT';
  type: ObjectConstructor;
  default: Record<string, string | number>;
  keys?: string[];
  suffix?: string;
  options?: {
    label?: string | number;
    value: string | number;
    icon?: string;
    hint?: string;
  }[];
}

declare type SchemaKeyType =
  | ISchemaInputData
  | ISchemaSelectData
  | ISchemaColorPickerData
  | ISchemaGroupCheckData
  | ISchemaCompoundInputData
  | ISchemaStrokeData
  | ISchemaGroupSelectData
  | ISchemaButtonData
  | ISchemaInputGroupData
  | ISchemaEdgeData
  | ISchemaCodeEditorData
  | ISchemaPositionData
  | ISchemaKeyNumberData
  | ISchemaKeyStringData
  | ISchemaKeyBooleanData
  | ISchemaArrayData
  | ISchemaKeyObjectData
  | ISchemaBlendData
  | ISchemaBlendsData
  | ISchemaSelectInputData
  | ISchemaFunctionData;

declare type SchemaKeyTypes = SchemaKeyType[] | SchemaKeyType[][] | { [key: string]: SchemaKeyType };

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
