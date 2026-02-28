import options from '../options';

const SCHEMA_NAME = 'ECHARTS_HEATMAP';
const SCHEMA_KEY = 'heatmap';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
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
                key: 'label.textAlign',
                v_if: 'label.show',
                type: String,
                default: 'left',
                ctrl: 'C_GROUP_SELECT',
                options: options.TextAlignOptions
            },
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
    ],
    conditionsSchema: [
        [
            {
                label: '单元格边框颜色',
                key: 'itemStyle.borderColor',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#fff',
                ctrl_type: 'color-input'
            }
        ]
    ]
};

export default schema;
