export const getLayoutTemplate = (rootType: string, chartName: string, chartType: string): string => {
    return JSON.stringify({
        content: "布局描述",
        type: "text",
        data: {
            nodes: [
                {
                    parentId: "",
                    id: "root",
                    component: rootType,
                    schema: rootType,
                    name: "根容器",
                    width: 1920,
                    height: 1080,
                    x: 0,
                    y: 0,
                    props: {
                        layout: { width: 1920, height: 1080 },
                        fill: { color: "hsla(0,0%,13%,1)" }
                    }
                },
                {
                    parentId: "root",
                    id: "chart-1",
                    name: chartName,
                    component: chartType,
                    schema: chartType,
                    width: 600,
                    height: 400,
                    x: 50,
                    y: 50,
                    props: {
                        layout: { x: 50, y: 50, width: 600, height: 400 },
                        code: { options: "{}" },
                    }
                }
            ]
        }
    });
};
