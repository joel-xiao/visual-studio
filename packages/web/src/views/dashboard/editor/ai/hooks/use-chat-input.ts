import { ref } from 'vue';

export function useChatInput() {
  const inputValue = ref('');
  const loading = ref(false);

  return {
    inputValue,
    loading
  };
}

