import { ref, watch, toRefs } from 'vue';

export function useChartOptions(props: { config?: IComponentProps }, defaultOption: Record<string, unknown>) {
  const option = ref({ ...defaultOption });
  const { config } = toRefs(props);

  watch(
    () => config?.value,
    (newVal) => {
      // Cast to any to access dynamic properties safely
      const code = newVal?.code as Record<string, unknown> | undefined;
      const optionsStr = code?.options;

      if (typeof optionsStr === 'string') {
        try {
          // Check if options string is empty or just braces
          if (!optionsStr || optionsStr.trim() === '{}') {
             return;
          }

          const newOptions = JSON.parse(optionsStr);
          option.value = { ...option.value, ...newOptions };
        } catch (e) {
          console.warn('Failed to parse chart options:', e);
        }
      }
    },
    { deep: true, immediate: true }
  );

  return { option };
}
