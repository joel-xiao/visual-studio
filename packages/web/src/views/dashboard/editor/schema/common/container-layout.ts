const SCHEMA_NAME = 'COMMON_CONTAINER_LAYOUT';
const SCHEMA_LABEL = '';
const SCHEMA_KEY = 'layout';

const schema: ISchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
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
        icon: 'icon-locking-ratio',
        ctrl: 'C_BUTTON',
        ctrl_type: 'status-button',
        size: 'mini'
      }
    ]
  ]
};
export default schema;
