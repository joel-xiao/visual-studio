/**
 * 布局架构师输出模板
 */
export const getLayoutTemplate = (width: number = 1920, height: number = 1080): string => {
    return `{
  "content": "对整体布局构思的简短描述",
  "type": "text",
  "data": {
    "nodes": [
      {
        "id": "root",
        "name": "根容器",
        "component": "CANVAS_ROOT",
        "schema": "CANVAS_ROOT",
        "parentId": "",
        "x": 0,
        "y": 0,
        "width": ${width},
        "height": ${height},
        "props": {
          "layout": { "width": ${width}, "height": ${height} },
          "fill": { "color": "hsla(0,0%,13%,1)" }
        }
      },
      {
        "id": "chart_unique_id",
        "name": "图表显示名称",
        "component": "组件类型(如: APACHE_ECHARTS_BAR_SIMPLE)",
        "schema": "组件类型(如: APACHE_ECHARTS_BAR_SIMPLE)",
        "parentId": "root",
        "x": 50,
        "y": 50,
        "width": 600,
        "height": 400,
        "props": {
          "layout": { "x": 50, "y": 50, "width": 600, "height": 400 },
          "code": { "options": "{}" }
        }
      }
    ]
  }
}`;
};
