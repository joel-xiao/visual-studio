import type { ContextMenuItem } from './types';
import { buildHierarchyItems } from './hierarchy';
import type { CreateNodeContext } from '../node-context';
import type { CreateComponentContext } from '../component-context';

const CMD = { icon: 'lucide:command' };
const SHIFT = { icon: 'lucide:arrow-big-up' };
const DEL = { icon: 'lucide:delete' };

export const buildNodeMenuItems = (
    nodeId: string,
    nodeContext: CreateNodeContext,
    componentContext: CreateComponentContext,
    coords?: { x: number; y: number }
): ContextMenuItem[] => {
    const selectedNodes = nodeContext.getSelectedNodes?.()?.value || [];
    const isMultiple = selectedNodes.length > 1;
    const hierarchyItems = buildHierarchyItems(nodeId, nodeContext, componentContext, coords);

    const menu: ContextMenuItem[] = [];

    // 1. Selection & Hierarchy
    if (hierarchyItems.length > 1) {
        menu.push({
            id: 'select-layer',
            label: '选择图层',
            icon: 'lucide:layers',
            children: hierarchyItems
        });
        menu.push({ id: 'div-selection', label: '', divider: true });
    }

    // 2. Main Editing
    menu.push({
        id: 'copy',
        label: '复制',
        icon: 'lucide:copy',
        shortcuts: [CMD, { label: 'C' }],
        action: () => { }
    });

    menu.push({
        id: 'paste',
        label: '粘贴到这里',
        icon: 'lucide:clipboard-paste',
        shortcuts: [CMD, { label: 'V' }],
        action: () => { }
    });

    menu.push({ id: 'div-edit', label: '', divider: true });

    // 3. Arrangement
    menu.push({
        id: 'move-up',
        label: '上移一层',
        icon: 'lucide:arrow-up-to-line',
        shortcuts: [CMD, { label: ']' }]
    });
    menu.push({
        id: 'move-down',
        label: '下移一层',
        icon: 'lucide:arrow-down-to-line',
        shortcuts: [CMD, { label: '[' }]
    });
    menu.push({ id: 'div-arrange', label: '', divider: true });

    // 4. Grouping
    menu.push({
        id: 'group',
        label: '创建编组',
        icon: 'lucide:group',
        shortcuts: [CMD, { label: 'G' }],
        disabled: !isMultiple,
        action: () => {
            nodeContext.groupSelectedNodes?.();
        }
    });

    menu.push({
        id: 'ungroup',
        label: '取消编组',
        icon: 'lucide:ungroup',
        shortcuts: [SHIFT, CMD, { label: 'G' }],
        action: () => {
            const target = selectedNodes.find(n => n.id === nodeId) || selectedNodes[0];
            const isGroup = target?.schema === 'GROUP';
            if (isGroup && target?.id) {
                nodeContext.unGroup?.(target.id);
            }
        }
    });

    menu.push({ id: 'div-group', label: '', divider: true });

    // 5. Visibility / Locking
    menu.push({
        id: 'visible',
        label: '显示 / 隐藏图层',
        icon: 'lucide:eye',
        shortcuts: [SHIFT, CMD, { label: 'H' }]
    });
    menu.push({
        id: 'lock',
        label: '锁定 / 解锁图层',
        icon: 'lucide:lock',
        shortcuts: [SHIFT, CMD, { label: 'L' }]
    });

    menu.push({ id: 'div-state', label: '', divider: true });

    // 6. Delete
    menu.push({
        id: 'delete',
        label: '删除',
        icon: 'lucide:trash-2',
        shortcuts: [DEL],
        action: () => { }
    });

    return menu;
};
