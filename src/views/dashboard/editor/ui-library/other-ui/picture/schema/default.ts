import type { ComponentSchemaExport } from '../../../interface';

const schema: ComponentSchemaExport = {
  name: '图片',
  type: 'CONTROLS_PICTURE',
  icon: 'qw.png',
  schemas: [
    {
      type: 'schema',
      schema: 'COMMON_LAYOUT',
      default: {
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        rotate: 0,
        radius: [0, 0, 0, 0]
      }
    },
    {
      type: 'schema',
      schema: 'COMMON_LAYER',
      default: {
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        rotate: 0,
        radius: [0, 0, 0, 0]
      }
    }
  ]
};
export default schema;
