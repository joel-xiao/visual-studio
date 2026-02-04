const SCHEMA_NAME = 'ECHARTS_PIE';
const SCHEMA_KEY = 'pie';

const schema: ISchemaExport = {
    name: SCHEMA_NAME,
    label: '饼图效果',
    key: SCHEMA_KEY,
    conditionsSchema: [
        [
            {
                label: '扇区填充颜色',
                key: 'sectorColor',
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
