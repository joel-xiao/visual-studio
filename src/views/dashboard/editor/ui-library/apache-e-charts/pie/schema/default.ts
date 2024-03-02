import type { ComponentSchemaExport } from '../../../interface';

const schema: ComponentSchemaExport = {
  name: '基础饼图',
  type: 'APACHE_ECHARTS_PIE_SIMPLE',
  icon: 'ui-library/apache-e-charts/pie-simple.png',
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
    }
  ]
};
export default schema;
