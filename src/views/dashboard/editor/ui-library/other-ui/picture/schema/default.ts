import type { IComponentSchemaExport } from '../../../interface';

const schema: IComponentSchemaExport = {
  name: '图片',
  type: 'CONTROLS_PICTURE',
  icon: 'ui-library/qw.png',
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
  ],

  categorySchemas: [
    {
      name: '图表',
      icon: '',
      category: 'CHART',
      
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
      ],
    },
    {
      name: '标题',
      icon: '',
      category: 'TITLE',
      
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
      ],
    },
    {
      name: '图例',
      icon: '',
      category: 'LEGEND',
      
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
      ],
    }
  ]
};
export default schema;
