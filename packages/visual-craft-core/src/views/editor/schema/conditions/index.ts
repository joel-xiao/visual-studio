/**
 * Conditions Schema
 * 条件功能的 Schema 定义
 */

const SCHEMA_NAME = 'CONDITIONS';
const SCHEMA_KEY = 'conditions';

// 运算符选项
export const OperatorOptions = [
    { label: '=', value: 'eq' },
    { label: '≠', value: 'neq' },
    { label: '>', value: 'gt' },
    { label: '≥', value: 'gte' },
    { label: '<', value: 'lt' },
    { label: '≤', value: 'lte' },
    { label: '∋', value: 'contains' },
    { label: '∌', value: 'not_contains' },
    { label: '^=', value: 'starts_with' },
    { label: '$=', value: 'ends_with' },
    { label: '∅', value: 'is_empty' },
    { label: '!∅', value: 'is_not_empty' }
];

// 逻辑运算符选项
export const LogicOptions = [
    { label: '并且', value: 'and' },
    { label: '或者', value: 'or' }
];

// 字段选项类型
export interface IFieldOption {
    label: string;
    value: string;
    type?: 'string' | 'number';
}

// 默认字段选项
export const DefaultFieldOptions: IFieldOption[] = [
    { label: '系列', value: 's', type: 'string' },
    { label: 'X轴', value: 'x', type: 'string' },
    { label: 'Y轴', value: 'y', type: 'number' },
    { label: '数值', value: 'value', type: 'number' },
    { label: '名称', value: 'name', type: 'string' }
];

// 效果类型
export type EffectType = 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'candlestick';

// 条件表达式类型
export interface IConditionExpression {
    id: string;
    field: string;
    operator: string;
    value: string | number;
}

// 条件组类型
export interface IConditionGroup {
    id: string;
    logic: 'and' | 'or';
    expressions: IConditionExpression[];
    groups?: IConditionGroup[];
}

// 图表效果配置
export interface IChartEffect {
    // 通用
    color?: string;
    opacity?: number;
    // 柱状图
    borderColor?: string;
    borderWidth?: number;
    // 折线图
    lineColor?: string;
    lineWidth?: number;
    lineType?: 'solid' | 'dashed' | 'dotted';
    areaColor?: string;
    // 饼图
    sectorColor?: string;
    // 散点图
    symbolSize?: number;
    // 雷达图
    radarColor?: string;
    // K线图
    upColor?: string;
    downColor?: string;
}

// 条件配置类型
export interface IConditionConfig {
    id: string;
    name: string;
    enabled: boolean;
    logic: 'and' | 'or';
    groups: IConditionGroup[];
    effects: IChartEffect;
}

// 条件数据类型
export interface IConditionsData {
    conditions: IConditionConfig[];
    activeConditionId?: string;
}

// 响应效果 Schema 映射
export const EFFECT_SCHEMAS: Record<string, any[]> = {
    bar: [
        { label: '图形填充颜色', key: 'color', ctrl: 'C_COLOR_PICKER', props: { type: 'color-input', size: 'small' } },
        { label: '描孔/边框颜色', key: 'borderColor', ctrl: 'C_COLOR_PICKER', props: { type: 'color-input', size: 'small' } }
    ],
    line: [
        { label: '线条主色', key: 'lineColor', ctrl: 'C_COLOR_PICKER', props: { type: 'color-input', size: 'small' } },
        { label: '区域填充', key: 'areaColor', ctrl: 'C_COLOR_PICKER', props: { type: 'color-input', size: 'small' } }
    ],
    pie: [
        { label: '扇区填充颜色', key: 'sectorColor', ctrl: 'C_COLOR_PICKER', props: { type: 'color-input', size: 'small' } },
        { label: '描边/边框颜色', key: 'borderColor', ctrl: 'C_COLOR_PICKER', props: { type: 'color-input', size: 'small' } }
    ],
    radar: [
        { label: '雷达色域', key: 'radarColor', ctrl: 'C_COLOR_PICKER', props: { type: 'color-input', size: 'small' } }
    ]
};

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '条件',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                key: 'conditions',
                type: Array,
                default: [],
                ctrl: 'C_CONDITIONS',
            }
        ]
    ]
};

export default schema;
