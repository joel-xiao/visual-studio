import options from '../options';

const SCHEMA_NAME = 'ECHARTS_RADAR_AXIS';
const SCHEMA_KEY = 'radar-axis';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '',
    key: SCHEMA_KEY,
    schema: [
        [
            {
                label: '网格线',
                key: 'splitLine',
                type: Object,
                default: {
                    show: true,
                    lineStyle: {
                        color: '#E0E6F1',
                        width: 1,
                        type: 'solid'
                    }
                },
                ctrl: 'C_STROKE',
                keys: ['lineStyle.color', 'lineStyle.width', 'lineStyle.type'],
                hint: ['颜色', '粗细', '类型'],
                options: options.LineStyleOptions,
                suffix: 'px'
            }
        ],
        [
            {
                label: '轴线',
                key: 'axisLine',
                type: Object,
                default: {
                    show: true,
                    lineStyle: {
                        color: '#E0E6F1',
                        width: 1,
                        type: 'solid'
                    }
                },
                ctrl: 'C_STROKE',
                keys: ['lineStyle.color', 'lineStyle.width', 'lineStyle.type'],
                hint: ['颜色', '粗细', '类型'],
                options: options.LineStyleOptions,
                suffix: 'px'
            }
        ],
        [
            {
                content: '指示器名称',
                key: 'axisName.show',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                hint: '字体',
                key: 'axisName.fontFamily',
                v_if: 'axisName.show',
                type: String,
                default: 'Microsoft YaHei',
                icon: 'mdi:format-font',
                ctrl: 'C_SELECT',
                options: options.FontFamilyOptions
            }
        ],
        [
            {
                key: 'axisName.fontSize',
                v_if: 'axisName.show',
                type: Number,
                default: 12,
                hint: '字号',
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'axisName.color',
                v_if: 'axisName.show',
                type: String,
                default: '#fff',
                hint: '颜色',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'axisName.styles',
                v_if: 'axisName.show',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                hint: '距离',
                key: 'nameGap',
                v_if: 'axisName.show',
                type: Number,
                default: 15,
                ctrl: 'C_INPUT',
                icon: 'mdi:arrow-expand-horizontal',
                size:'wide'
            }
        ],
        [
            {
                label: '刻度线',
                key: 'axisTick',
                type: Object,
                default: {
                    show: true,
                    length: 5,
                    lineStyle: {
                        color: '#E0E6F1',
                        width: 1,
                        type: 'solid'
                    }
                },
                ctrl: 'C_STROKE',
                keys: ['lineStyle.color', 'lineStyle.width', 'lineStyle.type'],
                hint: ['颜色', '粗细', '类型'],
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
                ctrl: 'C_INPUT',
                suffix: 'px',
                icon: 'mdi:ruler',
                size:'wide'
            }
        ],
        [
            {
                content: '轴标签',
                key: 'axisLabel.show',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            }
        ],
        [
            {
                hint: '字体',
                key: 'axisLabel.fontFamily',
                v_if: 'axisLabel.show',
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
                v_if: 'axisLabel.show',
                type: Number,
                default: 12,
                hint: '字号',
                icon: 'mdi:format-size',
                ctrl: 'C_INPUT',
                size: 'large'
            },
            {
                key: 'axisLabel.color',
                v_if: 'axisLabel.show',
                type: String,
                default: '#fff',
                hint: '颜色',
                ctrl: 'C_COLOR_PICKER',
                size: 'mini'
            }
        ],
        [
            {
                key: 'axisLabel.styles',
                v_if: 'axisLabel.show',
                type: Array,
                default: [],
                ctrl: 'C_GROUP_CHECK',
                options: options.TextStyleOptions
            }
        ],
        [
            {
                hint: '边距',
                key: 'axisLabel.margin',
                v_if: 'axisLabel.show',
                type: Number,
                default: 8,
                ctrl: 'C_INPUT',
                icon: 'mdi:arrow-expand-horizontal'
            }
        ],
        [
            {
                content: '标签数',
                key: 'fixSplitNumber',
                type: Boolean,
                default: true,
                ctrl: 'C_LITE_SWITCH'
            },
            {
                key: 'splitNumber',
                v_if: 'fixSplitNumber',
                type: Number,
                default: 5,
                ctrl: 'C_INPUT',
                hint: '数量',
                icon: 'mdi:counter'
            }
        ]
    ]
};

export default schema;
