import { ref, reactive, type DeepReadonly, type Ref, unref, readonly } from 'vue';

export interface MarqueeRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface MarqueeOptions {
    getNodes: () => Readonly<Ref<readonly DeepReadonly<INode>[]>>;
    onSelect?: (ids: string[], isAppend: boolean) => void;
    getScale: () => number;
}

const isMarqueeSelecting = ref(false);
const marqueeRect = reactive<MarqueeRect>({ x: 0, y: 0, width: 0, height: 0 });

export const useMarqueeState = () => {
    return {
        isSelecting: readonly(isMarqueeSelecting),
        rect: marqueeRect
    };
};

export const useMarqueeSelect = (
    canvasRootEl: Ref<HTMLElement | undefined>,
    options: MarqueeOptions
) => {
    const { getNodes, onSelect, getScale } = options;

    let startX = 0;
    let startY = 0;

    const getNodesInArea = (selectionRect: MarqueeRect): string[] => {
        const nodes = unref(getNodes());
        const { x, y, width, height } = selectionRect;
        const x2_area = x + width;
        const y2_area = y + height;

        const allInArea: INode[] = [];
        for (const node of nodes) {
            if (node.id === 'root') continue;

            if (node.x < x2_area &&
                node.x + node.width > x &&
                node.y < y2_area &&
                node.y + node.height > y) {
                allInArea.push(node as unknown as INode);
            }
        }

        const areaIdSet = new Set(allInArea.map(n => n.id));
        const ids = allInArea
            .filter(node => !node.parentId || node.parentId === 'root' || !areaIdSet.has(node.parentId))
            .map(node => node.id);

        return ids.length ? ids : ['root'];
    };

    const updateRect = (currentX: number, currentY: number) => {
        if (!canvasRootEl.value) return;

        const canvasRect = canvasRootEl.value.getBoundingClientRect();
        const scale = getScale();

        const x1 = (startX - canvasRect.left) / scale;
        const y1 = (startY - canvasRect.top) / scale;
        const x2 = (currentX - canvasRect.left) / scale;
        const y2 = (currentY - canvasRect.top) / scale;

        Object.assign(marqueeRect, {
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1)
        });
    };

    const onMouseMove = (e: MouseEvent) => {
        if (isMarqueeSelecting.value) updateRect(e.clientX, e.clientY);
    };

    const onMouseUp = (e: MouseEvent) => {
        if (!isMarqueeSelecting.value) return;

        if (marqueeRect.width > 2 || marqueeRect.height > 2) {
            const ids = getNodesInArea({ ...marqueeRect });
            onSelect?.(ids, e.shiftKey);
        }

        isMarqueeSelecting.value = false;
        Object.assign(marqueeRect, { x: 0, y: 0, width: 0, height: 0 });

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;

        isMarqueeSelecting.value = true;
        startX = e.clientX;
        startY = e.clientY;
        updateRect(e.clientX, e.clientY);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return { onMouseDown };
};
