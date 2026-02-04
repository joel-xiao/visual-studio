const SCHEMA_NAME = 'ECHARTS_BAR';
const SCHEMA_KEY = 'bar';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '柱状图效果',
    key: SCHEMA_KEY,
    conditionsSchema: [
        [
            {
                label: '图形填充颜色',
                key: 'color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
            },
            {
                label: '描边/边框颜色',
                key: 'borderColor',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input'
            }
        ]
    ]
};

export default schema;
