import { onMounted, onUnmounted, type Ref } from 'vue';

export function useAutoResize(domRef: Ref<HTMLElement | undefined>, onResize: (width: number, height: number) => void) {
  let observer: ResizeObserver | null = null;
  let animationFrameId: number | null = null;

  const resizeHandler = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
      onResize(width, height);
      animationFrameId = null;
    });
  };

  onMounted(() => {
    if (domRef.value) {
      observer = new ResizeObserver(resizeHandler);
      observer.observe(domRef.value);
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  });
}
