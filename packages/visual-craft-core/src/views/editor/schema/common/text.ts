import options from '../options';

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
        default: '请输入文本内容',
        icon: 'mdi:format-text',
        ctrl: 'C_INPUT'
      }
    ],
    [
      {
        key: 'textStyle.fontFamily',
        type: String,
        default: 'Microsoft YaHei',
        icon: 'mdi:format-font',
        ctrl: 'C_SELECT',
        options: options.FontFamilyOptions
      }
    ],
    [
      {
        key: 'textStyle.fontSize',
        type: Number,
        default: 14,
        icon: 'mdi:format-size',
        ctrl: 'C_SELECT',
        ctrl_type: 'input-select',
        size: 'large',
        options: options.FontSizeOptions
      },
      {
        key: 'textStyle.color',
        type: String,
        default: '#fff',
        icon: '',
        ctrl: 'C_COLOR_PICKER',
        size: 'mini'
      }
    ],
    [
      {
        key: 'textStyle.lineHeight',
        type: String,
        default: '',
        icon: 'mdi:format-line-spacing',
        ctrl: 'C_INPUT',
        size: 'middle'
      },
      {
        key: 'textStyle.letterSpacing',
        type: String,
        default: '',
        icon: 'mdi:format-letter-spacing',
        ctrl: 'C_INPUT',
        size: 'middle'
      }
    ],
    [
      {
        key: 'textStyle.textAlign',
        type: String,
        default: 'left',
        ctrl: 'C_GROUP_SELECT',
        options: options.TextAlignOptions
      },
    ],
    [
      {
        key: 'textStyle.styles',
        type: Array,
        default: [],
        ctrl: 'C_GROUP_CHECK',
        options: options.TextStyleOptions
      }
    ]
  ]
};
export default schema;
