const SCHEMA_NAME = 'COMMON_LAYOUT';
const SCHEMA_KEY = 'layout';

const normalizeRotate = (deg: number) => {
  const normalized = ((deg % 360) + 360) % 360;
  return normalized >= 180 ? normalized - 360 : normalized;
};

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
    [
      {
        hint: '旋转角度',
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
        hint: '垂直翻转',
        ctrl: 'C_BUTTON',
        size: 'small',
        click: (props: ComponentProp) => {
          if (typeof props.rotate !== 'number') return;
          return { rotate: normalizeRotate(-props.rotate) };
        }
      },
      {
        key: 'reverse-x',
        type: Boolean,
        default: false,
        icon: 'mdi:flip-horizontal',
        hint: '水平翻转',
        ctrl: 'C_BUTTON',
        size: 'small',
        click: (props: ComponentProp) => {
          if (typeof props.rotate !== 'number') return;
          return { rotate: normalizeRotate(180 - props.rotate) };
        }
      }
    ],
    [
      {
        key: 'radius',
        label: '圆角',
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
        label: '内边距',
        type: Array,
        default: [0, 0, 0, 0],
        size: 'large',
        ctrl: 'C_EDGE'
      }
    ]
  ]
};
export default schema;
