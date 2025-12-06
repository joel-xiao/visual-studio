const SCHEMA_NAME = 'COMMON_LAYOUT';
const SCHEMA_KEY = 'layout';

const schema: ISchemaExport = {
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
        icon: 'icon-locking-ratio',
        ctrl: 'C_BUTTON',
        ctrl_type: 'status-button',
        size: 'mini'
      }
    ],
    [
      {
        key: 'rotate',
        type: Number,
        default: 0,
        icon: 'icon-rotate',
        ctrl: 'C_INPUT',
        size: 'middle'
      },
      {
        key: 'reverse-y',
        type: Boolean,
        default: false,
        icon: 'icon-reverse-y',
        ctrl: 'C_BUTTON',
        size: 'small',
        click: props => {
          if (typeof props.rotate === 'number') {
            props.rotate = -props.rotate;
          }
        }
      },
      {
        key: 'reverse-x',
        type: Boolean,
        default: false,
        icon: 'icon-reverse-x',
        ctrl: 'C_BUTTON',
        size: 'small',
        click: props => {
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
        ctrl: 'INPUT_GROUP'
      }
    ]
  ]
};
export default schema;
