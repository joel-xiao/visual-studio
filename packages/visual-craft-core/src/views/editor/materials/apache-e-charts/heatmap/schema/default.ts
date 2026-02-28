const schema: IComponentSchemaExport = {
    name: '基础热力图',
    type: 'APACHE_ECHARTS_HEATMAP_SIMPLE',
    icon: 'materials/apache-e-charts/heatmap-cartesian.png',
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
                    schema: 'ECHARTS_HEATMAP',
                    label: '',
                    key: 'series.0',
                    default: {
                        coordinateSystem: 'cartesian2d',
                        orient: 'horizontal',
                        backgroundColor: '#ffffff00',
                        itemStyle: {
                            borderColor: '#ffffff00',
                            borderWidth: 0,
                            borderType: 'solid',
                            shadowColor: '#00000033',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 0
                        },
                        label: {
                            show: false,
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
                        value: '热力图标题'
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
                    show_switch: false,
                    type: 'schema',
                    schema: 'ECHARTS_LEGEND',
                    label: '图例设置',
                    key: 'legend',
                    default: {
                        show: false
                    }
                }
            ]
        },
        {
            name: '坐标轴',
            icon: '',
            category: 'AXIS',
            schemas: [],
            schemasTabs: [
                {
                    name: 'X轴',
                    tab: 'xAxis',
                    schemas: [
                        {
                            type: 'schema',
                            schema: 'ECHARTS_AXIS',
                            label: '',
                            key: 'xAxis',
                            default: {
                                type: 'category',
                                axisLabel: {
                                    fontFamily: 'Microsoft YaHei',
                                    fontSize: 12,
                                    color: '#fff',
                                    styles: []
                                },
                                axisLine: {
                                    show: true,
                                    color: '#fff',
                                    width: 1,
                                    type: 'solid'
                                },
                                splitLine: {
                                    show: false
                                }
                            }
                        }
                    ]
                },
                {
                    name: 'Y轴',
                    tab: 'yAxis',
                    schemas: [
                        {
                            type: 'schema',
                            schema: 'ECHARTS_AXIS',
                            label: '',
                            key: 'yAxis',
                            default: {
                                type: 'category',
                                axisLabel: {
                                    fontFamily: 'Microsoft YaHei',
                                    fontSize: 12,
                                    color: '#fff',
                                    styles: []
                                },
                                axisLine: {
                                    show: true,
                                    color: '#fff',
                                    width: 1,
                                    type: 'solid'
                                },
                                splitLine: {
                                    show: false
                                }
                            }
                        }
                    ]
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
                        textStyle: {
                            fontFamily: 'SimSun',
                            fontSize: 12,
                            color: '#fff',
                            styles: []
                        },
                        padding: [10, 10],
                        borderColor: '#000000A6',
                        backgroundColor: '#000000A6'
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
                            schema: 'ECHARTS_HEATMAP'
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
