/**
 * 数据分析师输出模板
 */
export const getDataTemplate = (): string => {
    return `{
  "content": "对本次数据生成/分析的简短文字描述",
  "type": "code",
  "data": {
    "insight": "深度数据洞察，描述数据背后的业务逻辑或发现",
    "chartDataMap": {
      "NODE_ID": {
        "title": { "text": "图表标题" },
        "xAxis": { "data": ["类别1", "类别2", "..."] },
        "series": [
          {
            "name": "系列名称",
            "type": "bar",
            "data": [100, 200, "..."]
          }
        ]
      }
    }
  }
}`;
};
