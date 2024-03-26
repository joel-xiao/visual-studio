const SCHEMA_NAME = 'COMMON_TEXT';
const SCHEMA_LABEL = '文字';
const SCHEMA_KEY = 'text';

const schema: ISchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'value',
        type: String,
        default: '这是文本',
        icon: '',
        ctrl: 'C_INPUT'
      },
    ],
    [
      {
        key: 'fontFamily',
        type: String,
        default: '',
        icon: '',
        ctrl: 'C_SELECT'
      },
    ],
    [
      {
        key: 'fontSize',
        type: Number,
        default: 12,
        icon: '',
        ctrl: 'C_INPUT',
        size: 'large',
      },
      {
        key: 'color',
        type: String,
        default: '#fff',
        icon: '',
        ctrl: 'C_COLOR_PICKER',
        size: 'mini'
      },
    ],
  ]
};
export default schema;
