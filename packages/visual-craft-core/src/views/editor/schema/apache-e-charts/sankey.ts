import options from '../options';

const SCHEMA_NAME = 'ECHARTS_SANKEY';
const SCHEMA_KEY = 'sankey';

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
            }
        ],
        [
            {
                label: '宽度',
                key: 'nodeWidth',
                type: Number,
                default: 20,
                icon: 'mdi:arrow-expand-horizontal',
                ctrl: 'C_SLIDER',
                min: 1,
                max: 100
            }
        ],
        [
            {
                label: '对齐',
                key: 'nodeAlign',
                type: String,
                default: 'justify',
                icon: 'mdi:format-align-justify',
                ctrl: 'C_SELECT',
                options: options.SankeyNodeAlignOptions
            },
            {
                label: '线颜色',
                key: 'lineStyle.color',
                type: String,
                default: '#2362E4',
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
                content: '可拖拽',
                key: 'draggable',
                type: Boolean,
                default: true,
                ctrl: 'C_CHIP_SWITCH'
            },
            {
                content: '交互高亮',
                key: 'emphasis.focus',
                type: String,
                default: 'adjacency',
                ctrl: 'C_CHIP_SWITCH',
                active_value: 'adjacency',
                inactive_value: 'none'
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
                default: 10,
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
                default: 'right',
                hint: '位置',
                icon: 'mdi:format-align-center',
                ctrl: 'C_SELECT',
                size: 'wide',
                options: options.ChartLabelPositionOptions
            }
        ]
    ],
    conditionsSchema: [
        [
            {
                label: '节点填充颜色',
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
