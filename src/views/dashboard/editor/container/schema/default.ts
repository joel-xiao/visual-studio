import type { ComponentSchemaExport } from './../../hooks/component-context/interface';

const schema: ComponentSchemaExport = {
  name: '根容器',
  type: 'CANVAS_CONTAINER',
  icon: 'qw.png',
  schemas: [
    {
      type: 'schema',
      schema: 'COMMON_CONTAINER_LAYOUT',
      default: {
        width: 1000,
        height: 600,
        background: ''
      }
    }
  ]
};
export default schema;
