const schema: IComponentSchemaExport = {
    name: '基础盒须图',
    type: 'APACHE_ECHARTS_BOXPLOT_SIMPLE',
    icon: 'materials/apache-e-charts/boxplot-light-velocity.png',
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
                    schema: 'ECHARTS_BOXPLOT',
                    label: '',
                    key: 'series.0',
                    default: {
                        orient: 'horizontal',
                        backgroundColor: '#ffffff00',
                        boxWidth: [7, 50],
                        itemStyle: {
                            color: '#3662EC',
                            borderColor: '#3662EC',
                            borderWidth: 1,
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
                    key: 'title.0',
                    default: {
                        value: '盒须图标题'
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
                                type: 'value',
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
                            schema: 'ECHARTS_BOXPLOT'
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
