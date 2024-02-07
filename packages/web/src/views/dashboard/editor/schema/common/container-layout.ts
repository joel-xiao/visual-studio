import type { SchemaExport } from '../interface';
const SCHEMA_NAME = 'COMMON_CONTAINER_LAYOUT';
const SCHEMA_LABEL = '';
const SCHEMA_KEY = 'layout';

const schema: SchemaExport = {
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
        ctrl: 'input'
      },
      {
        key: 'height',
        type: Number,
        default: 0,
        icon: 'H',
        ctrl: 'input'
      },
      {
        key: 'size_proportion_lock',
        type: Boolean,
        default: false,
        icon: 'icon-locking-ratio',
        ctrl: 'button',
        ctrl_type: 'status-button',
        size: 'right'
      }
    ]
  ]
};
export default schema;
