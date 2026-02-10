import options from '../options';

const SCHEMA_NAME = 'ECHARTS_BAR';
const SCHEMA_KEY = 'bar';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                hint: '宽度',
                key: 'barWidth',
                type: Number,
                default: 50,
                icon: 'mdi:arrow-expand-horizontal',
                ctrl: 'C_INPUT'
            },
            {
                hint: '间距',
                key: 'barCategoryGap',
                type: Number,
                default: 100,
                icon: 'mdi:format-horizontal-align-center',
                ctrl: 'C_INPUT'
            }
        ],
        [
            {
                key: 'itemStyle.borderRadius',
                label: '圆角',
                type: Array,
                default: [0, 0, 0, 0],
                icon: [
                    'tabler:radius-top-left',
                    'tabler:radius-top-right',
                    'tabler:radius-bottom-left',
                    'tabler:radius-bottom-right'
                ],
                ctrl: 'INPUT_GROUP'
            }
        ],
        [
            {
                label: '填充',
                key: 'itemStyle.color',
                type: String,
                default: '#3662EC',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input'
            },
            {
                label: '背景',
                key: 'backgroundStyle.color',
                type: String,
                default: '#B4B4B41A',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input'
            }
        ],
        [
            {
                label: '描边',
                key: 'itemStyle',
                type: Object,
                default: {
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
                    shadowColor: '#00000033',
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 0
                },
                ctrl: 'C_MIX_GROUP',
                keys: ['shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'],
                ctrls: ['C_COLOR_PICKER', 'C_INPUT', 'C_INPUT', 'C_INPUT'],
                hints: ['颜色', 'X轴偏移', 'Y轴偏移', '模糊程度'],
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
                label: '图形填充颜色',
                key: 'itemStyle.color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input'
            },
            {
                label: '描边/边框颜色',
                key: 'itemStyle.borderColor',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input'
            }
        ]
    ]
};

export default schema;
