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
import type { DragDataset, Binding } from '@d/drag-resize/interface';

interface Props {
  data: DragDataset;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({ y2: 0, x2: 0, x: 0, y: 0 })
});

const emit = defineEmits(['resizing']);

const dragData = reactive<Binding>({
  pos: props.data,
  disabled: false,
  active: false,
  scale: 1,
  onUp: (dragDataset: DragDataset) => {
    emit('resizing', dragDataset);
  }
});

const dragDataComputed = computed<Binding>(() => ({ ...dragData }));

const setActive = function (val: boolean | undefined): void {
  dragData.active = !!val;
};

const setPos = function (pos: DragDataset): void {
  dragData.pos = pos;
};

const setScale = function (scale: number) {
  dragData.scale = scale;
};

defineExpose({ setActive, setPos, setScale });
</script>

<style lang="scss">
.editor-drag-resize {
  .editor-drag-resize-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
