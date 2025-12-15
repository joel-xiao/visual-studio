export const getDataTemplate = (): string => {
    return JSON.stringify({
        content: "数据描述",
        type: "code",
        data: {
            schema: [{ name: "Month", type: "string" }],
            mockData: [{ Month: "Jan", Value: 100 }],
            insight: "简短数据洞察",
            chartDataMap: {
                "chart-1": {
                    xAxis: { data: ["A", "B"] },
                    series: [{ data: [10, 20] }]
                }
            }
        }
    });
};
