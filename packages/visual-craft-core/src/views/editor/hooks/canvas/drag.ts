export class Drag {
    onDragStart(item: PanelComponent, event: DragEvent): void {
        event.dataTransfer?.setData('component', JSON.stringify(item));
    }
    onDragStop(event: DragEvent): void {
        event.dataTransfer?.setData('component', '');
    }

    dropHandler(
        event: DragEvent,
        callback: (data: IBasicNode, pos: { x: number; y: number }) => void
    ): void {
        const data: string | undefined = event.dataTransfer?.getData('component');
        const node: PanelComponent = data ? JSON.parse(data) : undefined;
        if (node) {
            callback?.(node.data as IBasicNode, { x: event.x, y: event.y });
        }
    }

    onDragenter(event: DragEvent): void {
        event.preventDefault();
    }

    onDragover(event: DragEvent): void {
        event.preventDefault();
    }
}

export const useDrag = function () {
    const drag = new Drag();
    return {
        onDragStart: drag.onDragStart,
        onDragStop: drag.onDragStop,
        dropHandler: drag.dropHandler,
        onDragenter: drag.onDragenter,
        onDragover: drag.onDragover
    };
};
