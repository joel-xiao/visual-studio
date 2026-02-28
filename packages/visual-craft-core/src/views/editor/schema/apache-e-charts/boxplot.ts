import options from '../options';

const SCHEMA_NAME = 'ECHARTS_BOXPLOT';
const SCHEMA_KEY = 'boxplot';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '方向',
                key: 'orient',
                type: String,
                default: 'horizontal',
                icon: 'mdi:rotate-right',
                ctrl: 'C_SELECT',
                options: options.ChartOrientOptions
            },
            {
                label: '背景',
                key: 'backgroundColor',
                type: String,
                default: '#ffffff00',
                icon: 'mdi:format-color-fill',
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
                    borderWidth: 1,
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
                label: '描边颜色',
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
