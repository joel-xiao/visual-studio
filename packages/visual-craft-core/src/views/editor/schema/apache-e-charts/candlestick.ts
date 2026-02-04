const SCHEMA_NAME = 'ECHARTS_CANDLESTICK';
const SCHEMA_KEY = 'candlestick';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: 'K线图效果',
    key: SCHEMA_KEY,
    conditionsSchema: [
        [
            {
                label: '阳线颜色',
                key: 'color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#eb5454',
                ctrl_type: 'color-input',
                size: 'small'
            },
            {
                label: '阴线颜色',
                key: 'color0',
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
