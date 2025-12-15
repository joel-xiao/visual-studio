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
          if (!optionsStr || optionsStr.trim() === '{}') return;
          const newOptions = JSON.parse(optionsStr);
          option.value = { ...option.value, ...newOptions };
        } catch (e) {
          console.warn('Failed to parse chart options:', e);
        }
      } else if (typeof optionsStr === 'object' && optionsStr !== null) {
        option.value = { ...option.value, ...optionsStr };
      }
    },
    { deep: true, immediate: true }
  );

  return { option };
}
