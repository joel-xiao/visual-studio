const schema: IComponentSchemaExport = {
    name: '基础仪表盘',
    type: 'APACHE_ECHARTS_GAUGE_SIMPLE',
    icon: 'materials/apache-e-charts/gauge.png',
    schemas: [
        {
            type: 'schema',
            schema: 'COMMON_LAYOUT',
            default: {
                x: 0,
                y: 0,
                width: 400,
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
                    schema: 'ECHARTS_GAUGE',
                    key: 'series.0',
                    default: {
                        radius: 80,
                        innerRadius: 60,
                        startAngle: 225,
                        endAngle: -45,
                        itemStyle: {
                            color: '#3662EC',
                            borderColor: '#3662EC',
                            borderWidth: 0,
                            borderType: 'solid',
                            shadowColor: '#3662EC',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 0
                        },
                        title: {
                            show: true,
                            fontFamily: 'SimSun',
                            fontSize: 16,
                            color: '#fff',
                            styles: []
                        },
                        axisLabel: {
                            show: true,
                            fontFamily: 'SimSun',
                            fontSize: 14,
                            color: '#fff',
                            styles: []
                        },
                        detail: {
                            show: true,
                            fontFamily: 'SimSun',
                            fontSize: 20,
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
                        value: '仪表盘标题'
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
                            schema: 'ECHARTS_GAUGE'
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
