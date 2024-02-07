import type { SchemaExport } from '../interface';
const SCHEMA_NAME = 'COMMON_OLD_LAYOUT';
const SCHEMA_LABEL = 'OLD 布局';
const SCHEMA_KEY = 'layout';

const schema: SchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: {
    x: {
      type: Number,
      default: 0,
      icon: 'x',
      ctrl: 'input'
    },
    y: {
      type: Number,
      default: 0,
      icon: 'y',
      ctrl: 'input'
    },
    width: {
      type: Number,
      default: 0,
      icon: 'width',
      ctrl: 'input'
    },
    height: {
      type: Number,
      default: 0,
      icon: 'width',
      ctrl: 'input'
    },
    rotate: {
      type: Number,
      default: 0,
      icon: 'rotate',
      ctrl: 'input'
    },
    radius: {
      type: Array,
      default: [0, 0, 0, 0],
      icon: 'radius',
      ctrl: ''
    }
  }
};
export default schema;
