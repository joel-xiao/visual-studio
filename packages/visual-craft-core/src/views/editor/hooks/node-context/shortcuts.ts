import { onMounted, onUnmounted } from 'vue';
import type { CreateNodeContext } from './index';
import { useShortcuts } from '../canvas';

export const useKeyboardShortcuts = (nodeContext: CreateNodeContext) => {
    const { bindShortcut, unbindShortcut } = useShortcuts();
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const shortcuts = [
        {
            id: 'cut',
            key: 'x',
            [isMac ? 'meta' : 'ctrl']: true,
            action: (_e: KeyboardEvent) => {
                const selectedNodes = nodeContext.getSelectedNodes().value;
                if (selectedNodes.length > 0) {
                    nodeContext.clipboard.cut(selectedNodes.map(n => n.id));
                }
            }
        },
        {
            id: 'copy',
            key: 'c',
            [isMac ? 'meta' : 'ctrl']: true,
            action: (_e: KeyboardEvent) => {
                const selectedNodes = nodeContext.getSelectedNodes().value;
                if (selectedNodes.length > 0) {
                    nodeContext.clipboard.copy(selectedNodes.map(n => n.id));
                }
            }
        },
        {
            id: 'paste',
            key: 'v',
            [isMac ? 'meta' : 'ctrl']: true,
            action: (_e: KeyboardEvent) => {
                if (nodeContext.clipboard.hasClipboardData()) {
                    nodeContext.clipboard.paste();
                }
            }
        },
        {
            id: 'duplicate',
            key: 'd',
            [isMac ? 'meta' : 'ctrl']: true,
            action: (e: KeyboardEvent) => {
                e.preventDefault();
                const selectedNodes = nodeContext.getSelectedNodes().value;
                if (selectedNodes.length > 0) {
                    nodeContext.clipboard.duplicate(selectedNodes.map(n => n.id));
                }
            }
        },
        {
            id: 'select-all',
            key: 'a',
            [isMac ? 'meta' : 'ctrl']: true,
            action: (e: KeyboardEvent) => {
                e.preventDefault();
                const allNodes = nodeContext.getNodes().value;
                nodeContext.onSelectNodes(allNodes.map(n => n.id));
            }
        },
        {
            id: 'delete-1',
            key: 'Delete',
            action: (_e: KeyboardEvent) => {
                const selectedNodes = nodeContext.getSelectedNodes().value;
                selectedNodes.forEach(n => {
                    if (n.id !== 'root') nodeContext.removeNode(n.id);
                });
            }
        },
        {
            id: 'delete-2',
            key: 'Backspace',
            action: (_e: KeyboardEvent) => {
                const selectedNodes = nodeContext.getSelectedNodes().value;
                selectedNodes.forEach(n => {
                    if (n.id !== 'root') nodeContext.removeNode(n.id);
                });
            }
        },
        {
            id: 'group',
            key: 'g',
            [isMac ? 'meta' : 'ctrl']: true,
            action: (e: KeyboardEvent) => {
                e.preventDefault();
                if (e.shiftKey) {
                    const selectedNodes = nodeContext.getSelectedNodes().value;
                    selectedNodes.forEach(n => {
                        if (n.schema === 'GROUP') nodeContext.unGroup(n.id);
                    });
                } else {
                    nodeContext.groupSelectedNodes();
                }
            }
        }
    ];

    onMounted(() => {
        shortcuts.forEach(s => bindShortcut(s));
    });

    onUnmounted(() => {
        shortcuts.forEach(s => unbindShortcut(s.id));
    });
};
