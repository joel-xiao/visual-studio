import { ref, nextTick, onMounted, onUnmounted, type Ref } from 'vue';

export function useInputAreaHeight(inputAreaWrapperRef: Ref<HTMLElement | null>) {
  const inputAreaHeight = ref(130);

  let resizeObserver: ResizeObserver | null = null;

  onMounted(async () => {
    await nextTick();
    if (inputAreaWrapperRef.value) {
      // 初始化高度
      inputAreaHeight.value = inputAreaWrapperRef.value.offsetHeight + 20;
      
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          inputAreaHeight.value = entry.contentRect.height + 20; // 添加额外边距
        }
      });
      resizeObserver.observe(inputAreaWrapperRef.value);
    }
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  return {
    inputAreaHeight
  };
}

