import { Ref, onMounted, onBeforeUnmount } from 'vue';
import { MiddleMask } from './middle-mask';
type Rect = DOMRect | { width: number; height: number };

export const createMiddleMask = function (
  middleEl: Ref<HTMLElement | undefined>,
  middleContainerEl: Ref<HTMLElement | undefined>,
  key: string
): MiddleMask {
  let middleMask: MiddleMask | undefined = new MiddleMask();
  onMounted(() => {
    const orRect = { width: 0, height: 0 };
    const middleContainerRect: Rect = middleContainerEl?.value?.getBoundingClientRect() || orRect;
    const middleRect: Rect = middleEl?.value?.getBoundingClientRect() || middleContainerRect;

    const defaultPos = {
      x: (middleRect.width - middleContainerRect.width) / 2,
      y: (middleRect.height - middleContainerRect.height) / 2
    };
    defaultPos.x < 0 && (defaultPos.x = 0);
    defaultPos.y < 0 && (defaultPos.y = 0);

    middleMask?.install(
      middleEl.value,
      {
        defaultPos,
        onUpdated: (pos) => {
          middleContainerEl?.value &&
            (middleContainerEl.value.style.transform = `translate(${pos.x}px, ${pos.y}px)`);
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
