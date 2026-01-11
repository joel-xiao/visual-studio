import { useContextMenu } from './state';
import { buildNodeMenuItems } from './node-menu';
import { buildHierarchyItems } from './hierarchy';
import { buildCanvasMenuItems } from './canvas-menu';
import type { CreateNodeContext } from '../node-context';
import type { CreateComponentContext } from '../component-context';

export * from './types';
export * from './state';

/**
 * Hook to manage context menu interactions.
 * It now requires contexts to be passed in from the caller to stay decoupled.
 */
export const useNodeMenu = () => {
    const { open } = useContextMenu();

    const showNodeMenu = (
        e: MouseEvent,
        nodeId: string,
        nodeContext: CreateNodeContext,
        componentContext: CreateComponentContext,
        scale: number = 1
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const node = nodeContext.getNode(nodeId);
        if (node && node.id && !node.select) {
            nodeContext.onSelectNode(nodeId);
        }

        let coords: { x: number; y: number } | undefined = undefined;
        const canvasRootEl = document.getElementById('editor-canvas-root');
        if (canvasRootEl) {
            const rootRect = canvasRootEl.getBoundingClientRect();
            coords = {
                x: (e.clientX - rootRect.left) / scale,
                y: (e.clientY - rootRect.top) / scale
            };
        }

        const items = buildNodeMenuItems(nodeId, nodeContext, componentContext, coords);
        open(e.clientX, e.clientY, items);
    };

    const showCanvasMenu = (
        e: MouseEvent,
        nodeContext: CreateNodeContext,
        componentContext: CreateComponentContext,
        scale: number = 1
    ) => {
        e.preventDefault();
        e.stopPropagation();

        let coords: { x: number; y: number } | undefined = undefined;
        const canvasRootEl = document.getElementById('editor-canvas-root');
        if (canvasRootEl) {
            const rect = canvasRootEl.getBoundingClientRect();
            coords = {
                x: (e.clientX - rect.left) / scale,
                y: (e.clientY - rect.top) / scale
            };
        }

        const items = buildCanvasMenuItems(nodeContext, coords);

        if (coords) {
            const hierarchyItems = buildHierarchyItems('root', nodeContext, componentContext, coords);
            if (hierarchyItems.length > 0) {
                items.unshift({ id: 'div-selection', label: '', divider: true });
                items.unshift({
                    id: 'select-layer',
                    label: '选择图层',
                    icon: 'lucide:layers',
                    children: hierarchyItems
                });
            }
        }

        open(e.clientX, e.clientY, items);
    };

    return {
        showNodeMenu,
        showCanvasMenu
    };
};
