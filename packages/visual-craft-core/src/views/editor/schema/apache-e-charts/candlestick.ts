const SCHEMA_NAME = 'ECHARTS_CANDLESTICK';
const SCHEMA_KEY = 'candlestick';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '宽度',
                key: 'barWidth',
                type: Number,
                default: 30,
                ctrl: 'C_INPUT',
                suffix: 'px',
                icon: 'mdi:arrow-expand-horizontal'
            },
            {
                label: '描边',
                key: 'itemStyle.borderWidth',
                type: Number,
                default: 1,
                ctrl: 'C_INPUT',
                suffix: 'px',
                icon: 'mdi:border-outside'
            }
        ],
        [
            {
                label: '阳线',
                key: 'itemStyle.color',
                type: String,
                default: '#DE3B45',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input',
                hint: '颜色',
            },
            {
                label: '描边',
                key: 'itemStyle.borderColor',
                type: String,
                default: '#DE3B45',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input',
                hint: '描边颜色',
            }
        ],
        [
            {
                label: '阴线',
                key: 'itemStyle.color0',
                type: String,
                default: '#44A647',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input',
                hint: '颜色',
            },
            {
                label: '描边',
                key: 'itemStyle.borderColor0',
                type: String,
                default: '#44A647',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input',
                hint: '描边颜色',
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
                label: '透明度',
                key: 'itemStyle.opacity',
                type: Number,
                default: 1,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 1,
                step: 0.1
            }
        ],
        [
            {
                content: '区域缩放',
                key: 'dataZoom.show',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                content: '锁定区域',
                key: 'dataZoom.lock',
                v_if: 'dataZoom.show',
                type: Boolean,
                default: false,
                ctrl: 'C_CHIP_SWITCH',
                size: 'wide'
            }
        ],
        [
            {
                label: '窗口范围',
                key: 'dataZoom.start',
                v_if: 'dataZoom.show',
                type: Number,
                default: 0,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 100,
                hint: '开始'
            }
        ],
        [
            {
                key: 'dataZoom.end',
                v_if: 'dataZoom.show',
                type: Number,
                default: 100,
                ctrl: 'C_SLIDER',
                min: 0,
                max: 100,
                hint: '结束'
            }
        ],
    ],
    conditionsSchema: [
        [
            {
                label: '阳线颜色',
                key: 'itemStyle.color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#eb5454',
                ctrl_type: 'color-input',
                size: 'small'
            },
            {
                label: '阴线颜色',
                key: 'itemStyle.color0',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#47b262',
                ctrl_type: 'color-input',
                size: 'small'
            }
        ]
    ]
};

export default schema;
