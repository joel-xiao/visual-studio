import options from '../compossible/options';

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
        icon: 'icon-text',
        ctrl: 'C_INPUT'
      }
    ],
    [
      {
        key: 'fontFamily',
        type: String,
        default: 'SimSun',
        icon: 'icon-font-family',
        ctrl: 'C_SELECT',
        options: options.FontFamilyOptions
      }
    ],
    [
      {
        key: 'fontSize',
        type: Number,
        default: 12,
        icon: 'icon-text-size',
        ctrl: 'C_SELECT',
        ctrl_type: 'input-select',
        size: 'large',
        options: options.FontSizeOptions
      },
      {
        key: 'color',
        type: String,
        default: '#fff',
        icon: '',
        ctrl: 'C_COLOR_PICKER',
        size: 'mini'
      }
    ],
    [
      {
        key: 'lineHeight',
        type: String,
        default: '',
        icon: 'icon-line-height',
        ctrl: 'C_INPUT',
        size: 'middle'
      },
      {
        key: 'letterSpacing',
        type: String,
        default: '',
        icon: 'icon-letter-spacing',
        ctrl: 'C_INPUT',
        size: 'middle'
      }
    ]
  ]
};
export default schema;
