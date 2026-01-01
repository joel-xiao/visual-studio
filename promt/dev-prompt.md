## 提示词使用示例（按模板填写后直接发给助手）

```text
模板：T1 新增基础控件 schema（editor/schema）
schema name：COMMON_TEXT
分组 key：text
面板 label：文本
控件矩阵（二维数组）：[[{ key: "value", type: String, default: "默认文本", ctrl: "C_INPUT" }]]
是否有 click/change 联动：否
```

```text
模板：T2 新增组件 schema（IComponentSchemaExport）
组件 type：CONTROLS_PICTURE
schema 文件位置：materials/other-ui/picture/schema/default.ts
需要组合的基础 schema：COMMON_LAYOUT + COMMON_CODE_EDITOR
每个分组的 key/label/default 覆盖：layout={ width: 300, height: 200 }；code={ options: "" }
是否需要 categorySchemas：否
```

```text
模板：T3 新增物料组件（materials）
组件标识(type)：CONTROLS_PICTURE
组件目录：materials/other-ui/picture
需要的属性项：layout(x/y/width/height/rotate/radius) + code.options
默认值：layout={ width:300,height:200 }；code={ options:"" }
```

```text
模板：T4 新增属性面板控件（dashboard/ui）
控件组件路径：packages/web/src/views/dashboard/ui/controls/c-input/index.vue
控件 name：C_INPUT
schema.ctrl：C_INPUT
值类型：string
```

```text
模板：T5 新增 Agent（ai/agent）
role 目录名：chart-creator
输入数据结构：{ chartType: "bar" | "line"; title?: string; dataset?: unknown }
是否需要 apply：是
是否需要 UI：否
```
