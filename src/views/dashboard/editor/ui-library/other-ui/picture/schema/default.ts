export default {
  name: '图片',
  type: 'CONTROLS_PICTURE',
  icon: 'qw.png',
  schema: {
    layout: {
      type: 'schema',
      schema: 'COMMON_LAYOUT',
      required: true,
      default: {
        w: 300,
        h: 300,
        rotate: 0,
        radius: [0, 0, 0, 0]
      }
    }
  }
};
