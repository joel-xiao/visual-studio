import options from '../options';

const SCHEMA_NAME = 'ECHARTS_SCATTER';
const SCHEMA_KEY = 'scatter';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '半径范围',
                key: 'symbolSize',
                type: Array,
                default: [10, 10],
                ctrl: 'C_COMPOUND_INPUT',
                icon: ['mdi:arrow-expand-horizontal', 'mdi:arrow-expand-vertical'],
                keys: ['0', '1'],
                hint: ['宽', '高']
            }
        ],
        [
            {
                label: '描边',
                key: 'itemStyle',
                type: Object,
                default: {
                    color: '#3662EC',
                    borderColor: '#3662EC',
                    borderWidth: 0,
                    borderType: 'solid'
                },
                ctrl: 'C_STROKE',
                keys: ['borderColor', 'borderWidth', 'borderType'],
                hint: ['颜色', '粗细', '类型'],
                options: options.LineStyleOptions,
                suffix: 'px'
            }
        ],
        [
            {
                label: '阴影',
                key: 'itemStyle',
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
                hints: ['颜色', 'X', 'Y', '模糊']
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
                label: '散点填充颜色',
                key: 'itemStyle.color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
            },
            {
                label: '描边/边框颜色',
                key: 'itemStyle.borderColor',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
            }
        ]
    ]
};

export default schema;
