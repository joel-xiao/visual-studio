const SCHEMA_NAME = 'ECHARTS_SCATTER';
const SCHEMA_KEY = 'scatter';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '散点图效果',
    key: SCHEMA_KEY,
    conditionsSchema: [
        [
            {
                label: '散点填充颜色',
                key: 'color',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
                size: 'small'
            },
            {
                label: '描边/边框颜色',
                key: 'borderColor',
                ctrl: 'C_COLOR_PICKER',
                type: String,
                default: '#3662EC',
                ctrl_type: 'color-input',
                size: 'small'
            }
        ]
    ]
};

export default schema;
