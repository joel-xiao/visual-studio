import type { ContextMenuItem } from './types';
import type { CreateNodeContext } from '../node-context';

const CMD = { icon: 'lucide:command' };

export const buildCanvasMenuItems = (
    nodeContext: CreateNodeContext,
    coords?: { x: number; y: number }
): ContextMenuItem[] => {
    return [
        {
            id: 'paste',
            label: '粘贴',
            icon: 'lucide:clipboard-paste',
            shortcuts: [CMD, { label: 'V' }],
            disabled: !nodeContext.clipboard.hasClipboardData(),
            action: () => {
                const pos = coords ? { x: coords.x, y: coords.y } : undefined;
                nodeContext.clipboard.paste('root', { position: pos, offset: { x: 20, y: 20 } });
            }
        },
        { id: 'div-1', label: '', divider: true },
        {
            id: 'select-all',
            label: '全选',
            icon: 'lucide:check-circle',
            shortcuts: [CMD, { label: 'A' }],
            action: () => {
                const nodes = nodeContext.getNodes().value;
                nodeContext.onSelectNodes(nodes.map(n => n.id));
            }
        }
    ];
};
