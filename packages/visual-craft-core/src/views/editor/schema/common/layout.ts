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
        icon: 'mdi:aspect-ratio',
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
        icon: 'mdi:rotate-right',
        ctrl: 'C_INPUT',
        size: 'middle'
      },
      {
        key: 'reverse-y',
        type: Boolean,
        default: false,
        icon: 'mdi:flip-vertical',
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
        icon: 'mdi:flip-horizontal',
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
          'tabler:radius-top-left',
          'tabler:radius-top-right',
          'tabler:radius-bottom-left',
          'tabler:radius-bottom-right'
        ],
        ctrl: 'INPUT_GROUP'
      }
    ],
    [
      {
        key: 'padding',
        type: Array,
        default: [0, 0, 0, 0],
        size: 'large',
        ctrl: 'C_EDGE'
      }
    ]
  ]
};
export default schema;
