const SCHEMA_NAME = 'GROUP_LAYOUT';
const SCHEMA_KEY = 'layout';

const schema: ISchemaExport = {
  name: SCHEMA_NAME,
  label: '',
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'x',
        type: Number,
        default: 0,
        icon: 'X',
        ctrl: 'C_INPUT',
        size: 'middle'
      },
      {
        key: 'y',
        type: Number,
        default: 0,
        icon: 'Y',
        ctrl: 'C_INPUT',
        size: 'middle'
      }
    ],
    [
      {
        key: 'width',
        type: Number,
        default: 0,
        icon: 'W',
        ctrl: 'C_INPUT',
        size: 'middle'
      },
      {
        key: 'height',
        type: Number,
        default: 0,
        icon: 'H',
        ctrl: 'C_INPUT',
        size: 'middle'
      },
      {
        key: 'size_proportion_lock',
        type: Boolean,
        default: false,
        icon: 'mdi:aspect-ratio',
        ctrl: 'C_BUTTON',
        ctrl_type: 'status-button',
        size: 'mini'
      }
    ],
  ]
};
export default schema;
