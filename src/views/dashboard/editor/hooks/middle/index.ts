import { Ref, onMounted, onBeforeUnmount, readonly, markRaw } from 'vue';
import { MiddleMask, Pos } from './middle-mask';

type Rect = DOMRect | { width: number; height: number };

let middleMask: MiddleMask | undefined;
export const createMiddleMask = function (
  parentEl: Ref<HTMLElement | undefined>,
  containerEl: Ref<HTMLElement | undefined>,
  key: string
): MiddleMask {
  middleMask = new MiddleMask();
  onMounted(() => {
    const middleContainerRect: Rect = containerEl?.value?.getBoundingClientRect() || {
      width: 0,
      height: 0
    };
    const parentRect: Rect = parentEl?.value?.getBoundingClientRect() || middleContainerRect;

    const defaultPos = {
      x: (parentRect.width - middleContainerRect.width) / 2,
      y: (parentRect.height - middleContainerRect.height) / 2
    };
    defaultPos.x < 0 && (defaultPos.x = 0);
    defaultPos.y < 0 && (defaultPos.y = 0);

    middleMask?.install(
      parentEl.value,
      {
        defaultPos,
        onUpdated: (pos) => {
          containerEl?.value && (containerEl.value.style.translate = `${pos.x}px ${pos.y}px`);
          onMiddleMoveUpdate(pos);
        }
      },
      key
    );
  });

  onBeforeUnmount((): void => {
    middleMask?.uninstall();
    middleMask = undefined;
  });

  return middleMask;
};

type CallbackUpdate = (pos: Pos) => void;
const callbackUpdates: CallbackUpdate[] = [];

const addMiddleMoveUpdated = function (fn: CallbackUpdate): void {
  callbackUpdates.push(fn);
};

const removeMiddleMoveUpdate = function (fn: CallbackUpdate): void {
  const idx: number = callbackUpdates.findIndex((r) => r === fn);
  idx && callbackUpdates.splice(idx, 1);
};

const onMiddleMoveUpdate = function (pos: Pos): void {
  callbackUpdates.forEach((callback) => callback({ ...pos }));
};

const setMiddleScale = function (scale: number): void {
  // middleMask?.setMiddleScale(scale);
};
const setMiddleScaleOffset = function (pos: Pos): void {
  middleMask?.setMiddleScaleOffset(pos);
};

const getMiddleScaleOffset = function (): Pos {
  return middleMask?.getMiddleScaleOffset() || { x: 0, y: 0 };
};

export const useMiddle = function () {
  return readonly(
    markRaw({
      addMiddleMoveUpdated,
      removeMiddleMoveUpdate,
      setMiddleScale,
      setMiddleScaleOffset,
      getMiddleScaleOffset
    })
  );
};
