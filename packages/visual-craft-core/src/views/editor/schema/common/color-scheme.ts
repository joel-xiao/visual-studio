const SCHEMA_NAME = 'COMMON_COLOR_SCHEME';
const SCHEMA_LABEL = '配色方案';
const SCHEMA_KEY = 'colorScheme';

const schema: ISchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'theme',
        type: String,
        default: 'dark',
        ctrl: 'C_COLOR_SCHEME',
        label: '',
        size: 'large'
      }
    ]
  ]
};
export default schema;
