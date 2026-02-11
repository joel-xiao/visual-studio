import options from '../options';

const SCHEMA_NAME = 'ECHARTS_PIE';
const SCHEMA_KEY = 'pie';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '半径',
                key: 'radius.1',
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
                key: 'radius.0',
                type: Number,
                default: 0,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 100,
                suffix: '%'
            }
        ],
        [
            {
                label: '间距',
                key: 'padAngle',
                type: Number,
                default: 0,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 10,
                step: 0.1
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
                label: '角度',
                key: 'startAngle',
                type: Number,
                default: 90,
                icon: 'mdi:rotate-right',
                ctrl: 'C_INPUT',
                suffix: '°起',
                size: 'wide'
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
                label: '数据类型',
                key: 'label.type',
                v_if: 'label.show',
                type: String,
                default: 'percent',
                icon: 'mdi:database-outline',
                hint: '数据类型',
                ctrl: 'C_GROUP_SELECT',
                options: options.PieLabelTypeOptions
            }
        ],
        [
            {
                label: '精度',
                key: 'label.precision',
                v_if: 'label.show',
                type: Number,
                default: 2,
                icon: 'mdi:numeric',
                ctrl: 'C_INPUT',
                size: 'wide'
            }
        ],
        [
            {
                label: '文本样式',
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
                label: '对齐',
                key: 'label.position',
                v_if: 'label.show',
                type: String,
                default: 'outside',
                icon: 'mdi:format-align-center',
                ctrl: 'C_SELECT',
                size: 'wide',
                options: options.PieLabelPositionOptions
            }
        ]
    ],
    conditionsSchema: [
        [
            {
                label: '扇区填充颜色',
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
