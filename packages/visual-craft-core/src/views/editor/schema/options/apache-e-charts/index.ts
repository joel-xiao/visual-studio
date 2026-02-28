import radar from './radar';
export * from './radar';

export const MarkerOptions = [
    { label: '圆形', value: 'circle' },
    { label: '三角形', value: 'triangle' },
    { label: '矩形', value: 'rect' },
    { label: '圆角矩形', value: 'roundRect' },
    { label: '大头针', value: 'pin' },
    { label: '菱形', value: 'diamond' }
];

export const BarLabelPositionOptions = [
    { label: '顶部', value: 'top' },
    { label: '底部', value: 'bottom' },
    { label: '左侧', value: 'left' },
    { label: '右侧', value: 'right' },
    { label: '内部', value: 'inside' },
    { label: '内左侧', value: 'insideLeft' },
    { label: '内右侧', value: 'insideRight' },
    { label: '内顶部', value: 'insideTop' },
    { label: '内底部', value: 'insideBottom' }
];

export const PieLabelPositionOptions = [
    { label: '外部', value: 'outside' },
    { label: '内部', value: 'inside' },
    { label: '中心', value: 'center' }
];

export const PieLabelTypeOptions = [
    { label: '名称', value: 'name' },
    { label: '数值', value: 'value' },
    { label: '百分比', value: 'percent' }
];

export const ChartOrientOptions = [
    { label: '纵向', value: 'vertical' },
    { label: '横向', value: 'horizontal' }
];

export default {
    MarkerOptions,
    BarLabelPositionOptions,
    PieLabelPositionOptions,
    PieLabelTypeOptions,
    ChartOrientOptions,
    ...radar,
};

