const SCHEMA_NAME = 'ECHARTS_RADAR';
const SCHEMA_KEY = 'radar';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '雷达图效果',
    key: SCHEMA_KEY,
    conditionsSchema: [
        [
            {
                label: '雷达色域',
                key: 'radarColor',
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
