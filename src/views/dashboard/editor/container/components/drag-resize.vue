<template lang="pug">
div(
  class="editor-drag-resize"
  v-drag-resize="dragDataComputed"
  )
  div.editor-drag-resize-container
    slot
</template>

<script setup lang="ts">
import { ref, reactive, computed, readonly, markRaw, withDefaults } from 'vue';

import type { DargDataset, Binding } from '@d/darg-resize/interface';

interface Props {
  data: DargDataset;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({ y2: 0, x2: 0, x: 0, y: 0 })
});

const dragData = reactive<Binding>({
  initPos: props.data,
  disabled: false,
  active: false
});

const dragDataComputed = computed<Binding>(() => ({ ...dragData }));
const emit = defineEmits(['resizing']);

const setActive = function (val: boolean | undefined): void {
  dragData.active = !!val;
};
defineExpose({ setActive });
</script>

<style lang="scss">
.editor-drag-resize {
  --drag-resize-color: hsl(260, 100%, 66%);
  .editor-drag-resize-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
