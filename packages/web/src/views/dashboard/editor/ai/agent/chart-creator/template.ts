export const getChartTemplate = (_exampleType: string): string => {
    return JSON.stringify({
        content: "图表美化",
        type: "text",
        data: {
            options: {}
        }
    });
};

