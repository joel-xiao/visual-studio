import type { SchemaExport } from '../interface';
const SCHEMA_NAME = 'COMMON_LAYOUT';
const SCHEMA_LABEL = '布局';
const SCHEMA_KEY = 'layout';

const schema: SchemaExport = {
  name: SCHEMA_NAME,
  label: '', // SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'x',
        type: Number,
        default: 0,
        icon: 'X',
        ctrl: 'input'
      },
      {
        key: 'y',
        type: Number,
        default: 0,
        icon: 'Y',
        ctrl: 'input'
      }
    ],
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
    ],
    [
      {
        key: 'rotate',
        type: Number,
        default: 0,
        icon: 'icon-rotate',
        ctrl: 'input'
      },
      {
        key: '',
        type: Boolean,
        default: false,
        icon: 'icon-reverse-y',
        ctrl: 'button',
        size: 'small',
        click: (props) => {
          if (typeof props.rotate === 'number') {
            props.rotate = 180 - props.rotate;
          }
        }
      },
      {
        key: '',
        type: Boolean,
        default: false,
        icon: 'icon-reverse-x',
        ctrl: 'button',
        size: 'small',
        click: (props) => {
          if (typeof props.rotate === 'number') {
            props.rotate = 180 - props.rotate;
          }
        }
      }
    ],
    [
      {
        key: 'radius',
        type: Array,
        default: [0, 0, 0, 0],
        icon: [
          'icon-top-left-radius',
          'icon-top-right-radius',
          'icon-bottom-left-radius',
          'icon-bottom-right-radius'
        ],
        ctrl: 'input-group',
        size: 'largely'
      }
    ]
  ]
};
export default schema;
