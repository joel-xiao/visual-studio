import { onMounted, onUnmounted } from 'vue';
import type { CreateNodeContext } from './index';

export const useKeyboardShortcuts = (nodeContext: CreateNodeContext) => {
    const onKeyDown = (e: KeyboardEvent) => {
        // Avoid triggering shortcuts when typing in inputs/textareas
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        // Cmd/Ctrl + D: Duplicate
        if (modifier && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            const selectedNodes = nodeContext.getSelectedNodes().value;
            if (selectedNodes.length > 0) {
                nodeContext.clipboard.duplicate(selectedNodes.map(n => n.id));
            }
            return;
        }

        // Cmd/Ctrl + X: Cut
        if (modifier && e.key.toLowerCase() === 'x') {
            const selectedNodes = nodeContext.getSelectedNodes().value;
            if (selectedNodes.length > 0) {
                nodeContext.clipboard.cut(selectedNodes.map(n => n.id));
            }
            return;
        }

        // Cmd/Ctrl + C: Copy
        if (modifier && e.key.toLowerCase() === 'c') {
            const selectedNodes = nodeContext.getSelectedNodes().value;
            if (selectedNodes.length > 0) {
                nodeContext.clipboard.copy(selectedNodes.map(n => n.id));
            }
            return;
        }

        // Cmd/Ctrl + V: Paste
        if (modifier && e.key.toLowerCase() === 'v') {
            if (nodeContext.clipboard.hasClipboardData()) {
                nodeContext.clipboard.paste();
            }
            return;
        }

        // Cmd/Ctrl + A: Select All
        if (modifier && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            const allNodes = nodeContext.getNodes().value;
            nodeContext.onSelectNodes(allNodes.map(n => n.id));
            return;
        }

        // Delete / Backspace: Remove nodes
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedNodes = nodeContext.getSelectedNodes().value;
            if (selectedNodes.length > 0) {
                selectedNodes.forEach(n => {
                    if (n.id !== 'root') {
                        nodeContext.removeNode(n.id);
                    }
                });
            }
            return;
        }

        // Cmd/Ctrl + G: Group
        if (modifier && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            if (e.shiftKey) {
                // Ungroup
                const selectedNodes = nodeContext.getSelectedNodes().value;
                selectedNodes.forEach(n => {
                    if (n.schema === 'GROUP') {
                        nodeContext.unGroup(n.id);
                    }
                });
            } else {
                nodeContext.groupSelectedNodes();
            }
            return;
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', onKeyDown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', onKeyDown);
    });
};
