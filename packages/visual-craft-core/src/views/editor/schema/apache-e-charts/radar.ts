import options from '../options';

const SCHEMA_NAME = 'ECHARTS_RADAR';
const SCHEMA_KEY = 'radar';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '绘制类型',
                key: 'radar.shape',
                type: String,
                default: 'polygon',
                ctrl: 'C_GROUP_SELECT',
                options: options.RadarShapeOptions
            }
        ],
        [
            {
                label: '半径',
                key: 'radar.radius',
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
                label: '描边',
                key: 'series.0.lineStyle',
                type: Object,
                default: {
                    color: '#3662EC',
                    width: 2,
                    type: 'solid'
                },
                ctrl: 'C_STROKE',
                keys: ['color', 'width', 'type'],
                hint: ['颜色', '粗细', '类型'],
                options: options.LineStyleOptions,
                suffix: 'px'
            }
        ],
        [
            {
                label: '阴影',
                key: 'series.0.lineStyle',
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
                content: '显示面积',
                key: 'series.0.areaStyle.show',
                type: Boolean,
                default: false,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                hint: '透明',
                key: 'series.0.areaStyle.opacity',
                v_if: 'series.0.areaStyle.show',
                type: Number,
                default: 0.4,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 1,
                step: 0.1
            }
        ],
        [
            {
                content: '显示端点',
                key: 'series.0.showSymbol',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                hint: '端点样式',
                key: 'series.0.itemStyle.color',
                v_if: 'series.0.showSymbol',
                type: String,
                default: '#2362E4',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input',
            }
        ],
        [
            {
                content: '最大值',
                key: 'radar.fixMax',
                type: Boolean,
                default: false,
                ctrl: 'C_LITE_SWITCH'
            },
            {
                key: 'radar.indicatorMax',
                v_if: 'radar.fixMax',
                type: Number,
                default: 100,
                icon: 'mdi:arrow-up',
                ctrl: 'C_INPUT'
            }
        ],
        [
            {
                content: '显示数据',
                key: 'series.0.label.show',
                type: Boolean,
                default: false,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                hint: '字体',
                key: 'series.0.label.fontFamily',
                v_if: 'series.0.label.show',
                type: String,
                default: 'SimSun',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions
            }
        ],
        [
            {
                key: 'series.0.label.fontSize',
                v_if: 'series.0.label.show',
                type: Number,
                default: 12,
                hint: '字号',
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'series.0.label.color',
                v_if: 'series.0.label.show',
                type: String,
                default: '#fff',
                hint: '颜色',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'series.0.label.styles',
                v_if: 'series.0.label.show',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                key: 'series.0.label.position',
                v_if: 'series.0.label.show',
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
                label: '雷达色域',
                key: 'radarColor',
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
