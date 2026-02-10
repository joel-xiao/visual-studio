import { ref, watch, toRefs } from 'vue';
import { cloneDeep, merge } from 'lodash';

export function useChartOptions(props: { config?: IComponentProps }, defaultOption: Record<string, unknown>) {
  const option = ref(cloneDeep(defaultOption));
  const { config } = toRefs(props);

  watch(
    () => config?.value,
    (newVal) => {
      let currentOptions = cloneDeep(defaultOption);

      if (newVal?.props) {
        currentOptions = merge(currentOptions, newVal.props);
      }

      const code = newVal?.code as Record<string, unknown> | undefined;
      const optionsStr = code?.options;

      if (typeof optionsStr === 'string') {
        try {
          if (optionsStr && optionsStr.trim() !== '{}') {
            const newOptions = JSON.parse(optionsStr);
            currentOptions = merge(currentOptions, newOptions);
          }
        } catch (e) {
          console.warn('Failed to parse chart options:', e);
        }
      } else if (typeof optionsStr === 'object' && optionsStr !== null) {
        currentOptions = merge(currentOptions, optionsStr);
      }

      option.value = currentOptions;
    },
    { deep: true, immediate: true }
  );

  return { option };
}
