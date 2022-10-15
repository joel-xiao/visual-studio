import type { Component } from './../../panels/components/panel-component/interface';
const onDragStart = function (item: Component, event: DragEvent): void {
  event.dataTransfer?.setData('component', JSON.stringify(item));
};
const onDragStop = function (event: DragEvent): void {
  event.dataTransfer?.setData('component', '');
};

const dropHandler = function <T>(
  event: DragEvent,
  callback: (data: T, pos: { x: number; y: number }) => void
): void {
  const data: string | undefined = event.dataTransfer?.getData('component');
  const node: Component = data ? JSON.parse(data) : undefined;
  if (node) {
    callback?.(
      {
        name: node.data?.name,
        schema: node.data?.schema,
        component: node.data?.component
      } as T,
      { x: event.x, y: event.y }
    );
  }
};

const onDragenter = function (event: DragEvent): void {
  event.preventDefault();
};

const onDragover = function (event: DragEvent): void {
  event.preventDefault();
};

export const useDrag = function () {
  return {
    onDragStart,
    onDragStop,
    dropHandler,
    onDragenter,
    onDragover
  };
};
