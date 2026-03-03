const schema: IComponentSchemaExport = {
    name: '基础树图',
    type: 'APACHE_ECHARTS_TREE_SIMPLE',
    icon: 'materials/apache-e-charts/tree-simple.png',
    schemas: [
        {
            type: 'schema',
            schema: 'COMMON_LAYOUT',
            default: {
                x: 0,
                y: 0,
                width: 600,
                height: 400,
                rotate: 0,
                radius: [0, 0, 0, 0]
            }
        },
        {
            type: 'schema',
            schema: 'COMMON_LAYER',
            default: {
                blends: [{
                    mix: 'normal',
                    opacity: 1,
                    visible: true
                }]
            }
        },
        {
            type: 'schema',
            schema: 'COMMON_COLOR_SCHEME',
            default: {
                theme: 'dark'
            }
        },
    ],
    categorySchemas: [
        {
            name: '图表',
            icon: '',
            category: 'CHART',
            schemas: [
                {
                    type: 'schema',
                    schema: 'ECHARTS_TREE',
                    key: 'series.0',
                    default: {
                        padding: [5, 20, 5, 7],
                        orient: 'LR',
                        symbolSize: 7,
                        lineStyle: {
                            width: 1,
                            type: 'curve',
                            shadowColor: '#00000000',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            shadowColor: '#00000000',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 0
                        },
                        label: {
                            show: true,
                            fontFamily: 'SimSun',
                            fontSize: 12,
                            color: '#fff',
                            styles: []
                        }
                    }
                }
            ]
        },
        {
            name: '标题',
            icon: '',
            category: 'TITLE',
            schemas: [
                {
                    show_switch: true,
                    type: 'schema',
                    schema: 'COMMON_TEXT',
                    label: '标题',
                    key: 'title',
                    default: {
                        value: '树图标题'
                    }
                }
            ]
        },
        {
            name: '提示框',
            icon: '',
            category: 'TOOLTIP',
            schemas: [
                {
                    show_switch: true,
                    type: 'schema',
                    schema: 'ECHARTS_TOOLTIP',
                    key: 'tooltip',
                    default: {
                        trigger: 'item',
                        textStyle: {
                            fontFamily: 'SimSun',
                            fontSize: 12,
                            color: '#fff',
                            styles: []
                        }
                    }
                }
            ]
        },
        {
            name: '条件',
            icon: '',
            category: 'CONDITIONS',
            schemas: [
                {
                    type: 'schema',
                    schema: 'CONDITIONS',
                    key: 'conditions',
                    schemas: [
                        {
                            type: 'conditionsSchema',
                            schema: 'ECHARTS_TREE'
                        }
                    ]
                }
            ]
        },
        {
            name: '自定义',
            icon: '',
            category: 'CODE',
            schemas: [
                {
                    type: 'schema',
                    schema: 'COMMON_CODE_EDITOR',
                    default: {
                        options: ''
                    }
                }
            ]
        }
    ]
};
export default schema;
