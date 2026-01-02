const SCHEMA_NAME = 'COMMON_CANVAS_FILL';
const SCHEMA_LABEL = '填充';
const SCHEMA_KEY = 'fill';

const schema: ISchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'color',
        type: String,
        default: '',
        icon: 'C',
        ctrl: 'C_COLOR_PICKER',
        ctrl_type: 'color-input',
        size: 'large'
      }
    ]
  ]
};
export default schema;
