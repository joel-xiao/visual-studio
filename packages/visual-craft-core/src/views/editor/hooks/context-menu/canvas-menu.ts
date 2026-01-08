import type { ContextMenuItem } from './types';

const CMD = { icon: 'lucide:command' };

export const buildCanvasMenuItems = (): ContextMenuItem[] => {
    return [
        {
            id: 'paste',
            label: '粘贴',
            icon: 'lucide:clipboard-paste',
            shortcuts: [CMD, { label: 'V' }],
            action: () => { }
        },
        { id: 'div-1', label: '', divider: true },
        {
            id: 'select-all',
            label: '全选',
            icon: 'lucide:check-circle',
            shortcuts: [CMD, { label: 'A' }],
            action: () => { }
        }
    ];
};
