export default {
  name: '视频',
  type: 'CONTROLS_VIDEO',
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
