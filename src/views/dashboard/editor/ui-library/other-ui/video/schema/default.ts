import type { ComponentSchemaExport } from '../../../interface';

const schema: ComponentSchemaExport = {
  name: '视频',
  type: 'CONTROLS_VIDEO',
  icon: 'qw.png',
  schemas: [
    {
      type: 'schema',
      schema: 'COMMON_LAYOUT',
      required: true,
      default: {
        x: 0,
        y: 0,
        w: 300,
        h: 300,
        rotate: 0,
        radius: [0, 0, 0, 0]
      }
    }
  ]
};
export default schema;
