import { useContextMenu } from './state';
import { buildNodeMenuItems } from './node-menu';
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

    /**
     * Show menu for a specific node (right click on element).
     * Contexts must be provided to avoid internal hook dependencies.
     */
    const showNodeMenu = (
        e: MouseEvent,
        nodeId: string,
        nodeContext: CreateNodeContext,
        componentContext: CreateComponentContext,
        scale: number = 1
    ) => {
        e.preventDefault();
        e.stopPropagation();

        // Side effect: Selection management
        const node = nodeContext.getNode(nodeId);
        if (node && node.id && !node.select) {
            nodeContext.onSelectNode(nodeId);
        }

        // Calculate canvas coordinates for hit-testing overlapping components
        let coords: { x: number; y: number } | undefined = undefined;
        const canvasEl = document.getElementById('editor-canvas');
        if (canvasEl) {
            const rect = canvasEl.getBoundingClientRect();
            coords = {
                x: (e.clientX - rect.left) / scale,
                y: (e.clientY - rect.top) / scale
            };
        }

        const items = buildNodeMenuItems(nodeId, nodeContext, componentContext, coords);
        open(e.clientX, e.clientY, items);
    };

    /**
     * Show menu for the empty canvas.
     */
    const showCanvasMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const items = buildCanvasMenuItems();
        open(e.clientX, e.clientY, items);
    };

    return {
        showNodeMenu,
        showCanvasMenu
    };
};
