import options from '../options';

const SCHEMA_NAME = 'ECHARTS_TREE';
const SCHEMA_KEY = 'tree';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '外边距',
                key: 'padding',
                type: Array,
                default: [5, 20, 5, 7], // top, right, bottom, left
                ctrl: 'C_EDGE'
            }
        ],
        [
            {
                label: '线条',
                key: 'lineStyle',
                type: Object,
                default: {
                    width: 1,
                    type: 'curve'
                },
                ctrl: 'C_MIX_GROUP',
                keys: ['width', 'type'],
                ctrls: ['C_INPUT', 'C_SELECT'],
                hints: ['粗细', '类型'],
                options: [[], options.TreeEdgeShapeOptions],
                suffix: 'px'
            }
        ],
        [
            {
                label: '线阴影',
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
                hints: ['颜色', 'X', 'Y', '模糊']
            }
        ],
        [
            {
                label: '点阴影',
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
                label: '图表方向',
                key: 'orient',
                type: String,
                default: 'LR',
                icon: 'mdi:rotate-right',
                ctrl: 'C_SELECT',
                options: options.TreeOrientOptions,
                size: 'wide'
            }
        ],
        [
            {
                content: '显示数据',
                key: 'label.show',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                hint: '文本样式',
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
        ]
    ],
    conditionsSchema: [
        [
            {
                label: '节点颜色',
                key: 'itemStyle.color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
            }
        ]
    ]
};

export default schema;
