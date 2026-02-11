import { get } from 'lodash';
import options from '../options';

const SCHEMA_NAME = 'ECHARTS_LINE';
const SCHEMA_KEY = 'line';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '描边',
                key: 'lineStyle',
                type: Object,
                default: {
                    width: 2,
                    type: 'solid'
                },
                ctrl: 'C_MIX_GROUP',
                keys: ['width', 'type'],
                ctrls: ['C_INPUT', 'C_SELECT'],
                hints: ['粗细', '类型'],
                options: [undefined, options.LineStyleOptions],
                suffixes: ['px', '']
            }
        ],
        [
            {
                label: '阴影',
                key: 'lineStyle',
                type: Object,
                default: {
                    shadowColor: '#00000000',
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 0
                },
                ctrl: 'C_MIX_GROUP',
                keys: ['shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'],
                ctrls: ['C_COLOR_PICKER', 'C_INPUT', 'C_INPUT', 'C_INPUT'],
                hints: ['颜色', 'X轴偏移', 'Y轴偏移', '模糊程度']
            }
        ],
        [
            {
                content: '显示端点',
                key: 'showSymbol',
                type: Boolean,
                default: true,
                ctrl: 'C_CHIP_SWITCH'
            },
            {
                content: 'X轴留白',
                key: 'boundaryGap',
                type: Boolean,
                default: true,
                ctrl: 'C_CHIP_SWITCH'
            }
        ],
        [
            {
                content: '平滑张力',
                key: 'smooth',
                type: Boolean,
                default: false,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                key: 'smoothMonotone',
                v_if: 'smooth',
                type: Number,
                default: 0.5,
                min: 0,
                max: 1,
                step: 0.1,
                ctrl: 'C_SLIDER'
            }
        ],
        [
            {
                content: '显示面积',
                key: 'areaStyle.show',
                type: Boolean,
                default: false,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                key: 'areaStyle.opacity',
                v_if: 'areaStyle.show',
                type: Number,
                default: 0.1,
                min: 0,
                max: 1,
                step: 0.1,
                hint: '透明度',
                ctrl: 'C_SLIDER'
            }
        ],
        [
            {
                content: '显示数据',
                key: 'label.show',
                type: Boolean,
                default: false,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                hint: '字体',
                key: 'label.fontFamily',
                v_if: 'label.show',
                type: String,
                default: 'SimSun',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions
            }
        ],
        [
            {
                key: 'label.fontSize',
                v_if: 'label.show',
                type: Number,
                default: 12,
                hint: '字号',
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'label.color',
                v_if: 'label.show',
                type: String,
                default: '#fff',
                hint: '颜色',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'label.styles',
                v_if: 'label.show',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                key: 'label.position',
                v_if: 'label.show',
                type: String,
                default: 'top',
                hint: '对齐',
                icon: 'mdi:format-align-center',
                ctrl: 'C_SELECT',
                size: 'wide',
                options: options.BarLabelPositionOptions
            }
        ]
    ],
    conditionsSchema: [
        [
            {
                label: '线条主色',
                key: 'lineStyle.color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
            },
            {
                label: '区域填充',
                key: 'areaStyle.color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: 'transparent',
                ctrl_type: 'color-input',
            }
        ]
    ]
};

export default schema;

