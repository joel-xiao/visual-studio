import options from '../options';

const SCHEMA_NAME = 'ECHARTS_TOOLTIP';
const SCHEMA_KEY = 'tooltip';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '提示框',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                key: 'textStyle.fontFamily',
                type: String,
                default: 'SimSun',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions
            }
        ],
        [
            {
                key: 'textStyle.fontSize',
                type: Number,
                default: 12,
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'textStyle.color',
                type: String,
                default: '#fff',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'textStyle.styles',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                label: '背景',
                key: 'padding',
                type: Array,
                default: [10, 10],
                hint: ['水平边距', '垂直边距'],
                ctrl: 'C_COMPOUND_INPUT',
                icon: ['mdi:format-horizontal-align-center', 'mdi:format-vertical-align-center'],
                keys: ['1', '0'],
                suffix: 'px'
            }
        ],
        [
            {
                hint: '边框颜色',
                key: 'borderColor',
                type: String,
                default: '#000000A6',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input'
            },
            {
                hint: '背景颜色',
                key: 'backgroundColor',
                type: String,
                default: '#000000A6',
                ctrl: 'C_COLOR_PICKER',
                ctrl_type: 'color-input'
            }
        ]
    ]
};

export default schema;
