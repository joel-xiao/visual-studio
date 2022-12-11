import type { SchemaExport } from '../interface';
const SCHEMA_NAME = 'COMMON_LAYER';
const SCHEMA_LABEL = '图层';
const SCHEMA_KEY = 'layer';

const schema: SchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'x',
        type: Number,
        default: 0,
        icon: 'x',
        ctrl: 'input'
      },
      {
        key: 'y',
        type: Number,
        default: 0,
        icon: 'y',
        ctrl: 'input'
      }
    ],
    [
      {
        key: 'width',
        type: Number,
        default: 0,
        icon: 'width',
        ctrl: 'input'
      },
      {
        key: 'height',
        type: Number,
        default: 0,
        icon: 'height',
        ctrl: 'input'
      }
    ],
    [
      {
        key: 'rotate',
        type: Number,
        default: 0,
        icon: 'rotate',
        ctrl: 'input'
      }
    ],
    [
      {
        key: 'radius',
        type: Array,
        default: [0, 0, 0, 0],
        icon: 'radius',
        ctrl: ''
      }
    ]
  ]
};
export default schema;
