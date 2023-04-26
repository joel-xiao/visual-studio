import type { SchemaExport } from '../interface';
const SCHEMA_NAME = 'COMMON_LAYOUT';
const SCHEMA_LABEL = '布局';
const SCHEMA_KEY = 'layout';

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
      },
      {
        key: 'size_proportion_lock',
        type: Boolean,
        default: false,
        icon: '',
        ctrl: 'button',
        ctrl_type: 'status-button',
        size: 'right'
      }
    ],
    [
      {
        key: 'rotate',
        type: Number,
        default: 0,
        icon: 'rotate',
        ctrl: 'input'
      },
      {
        key: '',
        type: Boolean,
        default: false,
        icon: '',
        ctrl: 'button',
        size: 'small',
        click: (props) => {
          props.rotate = 180 - props.rotate;
        }
      },
      {
        key: '',
        type: Boolean,
        default: false,
        icon: '',
        ctrl: 'button',
        size: 'small',
        click: (props) => {
          props.rotate = -props.rotate;
        }
      }
    ],
    [
      {
        key: 'radius',
        type: Array,
        default: [0, 0, 0, 0],
        icon: 'radius',
        ctrl: 'input-group',
        size: 'largely'
      }
    ]
  ]
};
export default schema;
