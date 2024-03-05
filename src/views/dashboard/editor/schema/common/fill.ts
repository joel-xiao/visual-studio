import type { SchemaExport } from '../interface';
const SCHEMA_NAME = 'COMMON_CONTAINER_FILL';
const SCHEMA_LABEL = '填充';
const SCHEMA_KEY = 'fill';

const schema: SchemaExport = {
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
        size: 'large'
      },
    ]
  ]
};
export default schema;
