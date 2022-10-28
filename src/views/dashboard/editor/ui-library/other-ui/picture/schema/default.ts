import type { ComponentSchemaExport } from '../../../../schema/use/interface';

const schema: ComponentSchemaExport = {
  name: '图片',
  type: 'CONTROLS_PICTURE',
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
