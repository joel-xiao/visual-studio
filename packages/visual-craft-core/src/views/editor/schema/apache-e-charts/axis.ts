import options from '../options';

const SCHEMA_NAME = 'ECHARTS_AXIS';
const SCHEMA_KEY = 'axis';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                key: 'axisLabel.fontFamily',
                type: String,
                default: 'Microsoft YaHei',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions
            }
        ],
        [
            {
                key: 'axisLabel.fontSize',
                type: Number,
                default: 12,
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'axisLabel.color',
                type: String,
                default: '#fff',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'axisLabel.styles',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                label: '标签背景',
                key: 'axisLabel.backgroundColor',
                type: String,
                default: 'transparent',
                icon: 'mdi:format-color-fill',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input',
                size: 'large'
            }
        ],
        [
            {
                label: '背景边距',
                key: 'axisLabel.padding',
                type: Object,
                default: {
                    h: 0,
                    v: 0
                },
                icon: 'mdi:arrow-expand-all',
                ctrl: 'C_BOX_SPACING',
                suffix: 'px'
            }
        ],
        [
            {
                label: '标签数',
                key: 'splitNumber',
                type: Number,
                default: 5,
                icon: 'mdi:format-list-numbered',
                ctrl: 'C_INPUT',
                size: 'wide'
            }
        ],
        [
            {
                label: '轴线',
                key: 'axisLine',
                type: Object,
                default: {
                    show: true,
                    color: '#fff',
                    width: 1,
                    type: 'solid'
                },
                icon: 'mdi:vector-line',
                ctrl: 'C_STROKE',
                options: options.LineStyleOptions,
                suffix: 'px'
            }
        ],
        [
            {
                label: '刻度线',
                key: 'axisTick',
                type: Object,
                default: {
                    show: true,
                    color: '#fff',
                    width: 1,
                    type: 'solid'
                },
                icon: 'mdi:segment',
                ctrl: 'C_STROKE',
                options: options.LineStyleOptions,
                suffix: 'px'
            }
        ],
        [
            {
                hint: '长度',
                key: 'axisTick.length',
                v_if: 'axisTick.show',
                type: Number,
                default: 5,
                icon: 'mdi:arrow-expand-vertical',
                ctrl: 'C_INPUT',
                size: 'wide',
                suffix: 'px'
            }
        ],
        [
            {
                label: '网格线',
                key: 'splitLine',
                type: Object,
                default: {
                    show: true,
                    color: '#fff',
                    width: 1,
                    type: 'solid'
                },
                icon: 'mdi:grid',
                ctrl: 'C_STROKE',
                options: options.LineStyleOptions,
                suffix: 'px'
            }
        ]
    ]
};

export default schema;
