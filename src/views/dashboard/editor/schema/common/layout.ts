import type { SchemaExport } from '../interface';
const SCHEMA_NAME = 'COMMON_LAYOUT';
const SCHEMA_LABEL = '布局';
const SCHEMA_KEY = 'layout';

const schema: SchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: {
    x: {
      type: Number,
      default: 0,
      required: true,
      icon: 'x'
    },
    y: {
      type: Number,
      default: 0,
      required: true,
      icon: 'y'
    },
    width: {
      type: Number,
      default: 0,
      required: true,
      icon: 'width'
    },
    height: {
      type: Number,
      default: 0,
      required: true,
      icon: 'width'
    },
    rotate: {
      type: Number,
      default: 0,
      required: true,
      icon: 'rotate'
    },
    radius: {
      type: Array,
      default: [0, 0, 0, 0],
      required: true,
      icon: 'radius'
    }
  }
};
export default schema;
