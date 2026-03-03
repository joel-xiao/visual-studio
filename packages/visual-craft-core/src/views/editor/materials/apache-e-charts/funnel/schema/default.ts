const schema: IComponentSchemaExport = {
    name: '基础漏斗图',
    type: 'APACHE_ECHARTS_FUNNEL_SIMPLE',
    icon: 'materials/apache-e-charts/funnel.png',
    schemas: [
        {
            type: 'schema',
            schema: 'COMMON_LAYOUT',
            default: {
                x: 0,
                y: 0,
                width: 400,
                height: 300,
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
                    schema: 'ECHARTS_FUNNEL',
                    key: 'series.0',
                    default: {
                        sort: 'descending',
                        gap: 4,
                        itemStyle: {
                            borderColor: '#00000000',
                            borderWidth: 0,
                            borderType: 'solid',
                            shadowColor: '#3662EC',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 10
                        },
                        label: {
                            show: true,
                            fontFamily: 'SimSun',
                            fontSize: 12,
                            color: '#fff',
                            styles: [],
                            position: 'inside'
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
                        value: '漏斗图标题'
                    }
                }
            ]
        },
        {
            name: '图例',
            icon: '',
            category: 'LEGEND',
            schemas: [
                {
                    show_switch: true,
                    type: 'schema',
                    schema: 'ECHARTS_LEGEND',
                    label: '图例设置',
                    key: 'legend',
                    default: {
                        textStyle: {
                            fontFamily: 'SimSun',
                            fontSize: 12,
                            color: '#fff',
                            styles: []
                        },
                        position: 'top-center',
                        icon: 'circle',
                        itemWidth: 14,
                        itemGap: 10
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
                            schema: 'ECHARTS_FUNNEL'
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
