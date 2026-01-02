const SCHEMA_NAME = 'COMMON_CODE_EDITOR';
const SCHEMA_LABEL = '代码编辑';
const SCHEMA_KEY = 'code';

const schema: ISchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'options',
        type: String,
        default: '',
        ctrl: 'C_CODE_EDITOR',
      }
    ]
  ]
};
export default schema;
