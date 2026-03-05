import options from '../options';

const SCHEMA_NAME = 'ECHARTS_GAUGE';
const SCHEMA_KEY = 'gauge';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '半径',
                key: 'radius',
                type: Number,
                default: 80,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 100,
                suffix: '%'
            }
        ],
        [
            {
                label: '孔径',
                key: 'innerRadius',
                type: Number,
                default: 60,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 100,
                suffix: '%'
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
                    shadowColor: '#3662EC',
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
                label: '角度',
                key: '',
                type: Object,
                default: {
                    startAngle: 225,
                    endAngle: -45
                },
                ctrl: 'C_MIX_GROUP',
                keys: ['startAngle', 'endAngle'],
                ctrls: ['C_INPUT', 'C_INPUT'],
                hints: ['起', '终'],
                icons: ['mdi:rotate-right', 'mdi:rotate-left']
            }
        ],
        [
            {
                content: '仪表名称',
                key: 'title.show',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                key: 'title.fontFamily',
                v_if: 'title.show',
                type: String,
                default: 'SimSun',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions,
            }
        ],
        [
            {
                key: 'title.fontSize',
                v_if: 'title.show',
                type: Number,
                default: 16,
                hint: '字号',
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'title.color',
                v_if: 'title.show',
                type: String,
                default: '#fff',
                hint: '颜色',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'title.styles',
                v_if: 'title.show',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                content: '仪表刻度',
                key: 'axisLabel.show',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                key: 'axisLabel.fontFamily',
                v_if: 'axisLabel.show',
                type: String,
                default: 'SimSun',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions
            }
        ],
        [
            {
                key: 'axisLabel.fontSize',
                v_if: 'axisLabel.show',
                type: Number,
                default: 14,
                hint: '字号',
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'axisLabel.color',
                v_if: 'axisLabel.show',
                type: String,
                default: '#fff',
                hint: '颜色',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'axisLabel.styles',
                v_if: 'axisLabel.show',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                content: '显示数据',
                key: 'detail.show',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                label: '文本样式',
                key: 'detail.fontFamily',
                v_if: 'detail.show',
                type: String,
                default: 'SimSun',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions,
                size: 'wide'
            }
        ],
        [
            {
                key: 'detail.fontSize',
                v_if: 'detail.show',
                type: Number,
                default: 20,
                hint: '字号',
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'detail.color',
                v_if: 'detail.show',
                type: String,
                default: '#fff',
                hint: '颜色',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'detail.styles',
                v_if: 'detail.show',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ]
    ],
    conditionsSchema: [
        [
            {
                label: '仪表盘/指针颜色',
                key: 'itemStyle.color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
                size: 'wide'
            }
        ]
    ]
};

export default schema;
