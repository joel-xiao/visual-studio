import type { Component } from './../../panels/components/panel-component/interface';
const onDragStart = function (item: Component, event: DragEvent): void {
  event.dataTransfer?.setData('component', JSON.stringify(item));
};
const onDragStop = function (event: DragEvent): void {
  event.dataTransfer?.setData('component', '');
};

const dropHandler = function <T>(event: DragEvent, callback: (data: T) => void): void {
  const data: string | undefined = event.dataTransfer?.getData('component');
  callback?.(data ? JSON.parse(data) : undefined);
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
