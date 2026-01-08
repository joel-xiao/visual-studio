import options from '../options';

const SCHEMA_NAME = 'ECHARTS_LEGEND';
const SCHEMA_KEY = 'legend';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '图例',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '文本样式',
                key: 'textStyle.fontFamily',
                type: String,
                default: 'Microsoft YaHei',
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
                label: '显示位置',
                key: 'position',
                type: String,
                default: 'top-center',
                ctrl: 'C_POSITION'
            }
        ],
        [
            {
                label: '图例标记',
                key: '',
                type: Object,
                default: {
                    icon: 'circle',
                    itemWidth: 14
                },
                ctrl: 'C_SELECT_INPUT',
                keys: ['icon', 'itemWidth'],
                icon: ['mdi:shape', ''],
                suffix: 'px',
                options: options.MarkerOptions
            }
        ],
        [
            {
                hint: '间距',
                key: 'itemGap',
                type: Number,
                default: 10,
                icon: 'mdi:format-letter-spacing',
                ctrl: 'C_INPUT',
                size: 'wide',
                suffix: 'px'
            }
        ]
    ]
};

export default schema;
