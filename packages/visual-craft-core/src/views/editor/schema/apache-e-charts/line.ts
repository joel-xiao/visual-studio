const SCHEMA_NAME = 'ECHARTS_LINE';
const SCHEMA_KEY = 'line';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '折线图效果',
    key: SCHEMA_KEY,
    conditionsSchema: [
        [
            {
                label: '线条主色',
                key: 'lineColor',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
                size: 'small'
            },
            {
                label: '区域填充',
                key: 'areaColor',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: 'transparent',
                ctrl_type: 'color-input',
                size: 'small'
            }
        ]
    ]
};

export default schema;
