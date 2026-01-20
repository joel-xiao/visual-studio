<template>
<div v-hint="hint" class="basic-color-picker-wrapper">
  <ColorPicker v-bind="$attrs" v-model="modelValue" />
</div>
</template>

<script lang="ts">
import { hintDirective } from '../../../directives/hint';
import ColorPicker from '@/components/native-ui/color-picker/index.vue';

export default {
  components: {
    ColorPicker
  },
  directives: {
    hint: hintDirective
  }
};
</script>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    hint?: string;
  }>(),
  {
    modelValue: '',
    hint: ''
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});
</script>

<style lang="scss">
#visual-craft-core .basic-color-picker-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
}

#visual-craft-core .n-color-picker {
  width: 18px;
  height: 18px;
  flex: none;
  margin: 0px 6px;
  border-radius: 3px;
  overflow: hidden;

  .n-color-picker-trigger {
    border: none;
    border-radius: 0;

    .n-color-picker-trigger__fill {
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }
  }
}
</style>
