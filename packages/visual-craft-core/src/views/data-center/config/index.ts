export const DATA_CENTER_CONFIG = {
    folderTree: [
        { name: '全部数据', id: 'all', sum: 0, handle: false },
        { name: '未分组', id: 'no-group', sum: 0, handle: false }
    ],
    folderMenus: [
        {
            name: '更多操作',
            id: 'more',
            icon: 'mdi:dots-horizontal',
            children: [
                { name: '编辑分组', id: 'edit', icon: 'mdi:pencil-outline' },
                { name: '删除分组', id: 'delete', icon: 'mdi:delete-outline' },
                { name: '导入数据', id: 'import', icon: 'mdi:import' },
                { name: '导出数据', id: 'export', icon: 'mdi:export' }
            ]
        },
        { name: '新建分组', id: 'add', icon: 'mdi:plus' }
    ]
};
