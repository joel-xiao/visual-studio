const SCHEMA_NAME = 'COMMON_LAYOUT';

export default {
  name: SCHEMA_NAME,
  label: '布局',
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
