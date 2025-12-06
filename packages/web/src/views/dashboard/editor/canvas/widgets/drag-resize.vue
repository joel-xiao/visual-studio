<template>
<div
  v-drag-resize="dragDataComputed"
  class="editor-drag-resize"
  >
  <div class="editor-drag-resize__inner">
    <slot></slot>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, readonly, markRaw, withDefaults } from 'vue';

interface Props {
  data: IDragDataset;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({ y2: 0, x2: 0, x: 0, y: 0 })
});

const emit = defineEmits(['resizing']);

const dragData = reactive<IDragResizeBinding>({
  pos: props.data,
  disabled: false,
  active: false,
  scale: 1,
  onUp: (dragDataset: IDragDataset) => {
    emit('resizing', dragDataset);
  }
});

const dragDataComputed = computed<IDragResizeBinding>(() => ({ ...dragData }));

const setActive = function (val: boolean | undefined): void {
  dragData.active = !!val;
};

const setPos = function (pos: IDragDataset): void {
  dragData.pos = pos;
};

const setScale = function (scale: number) {
  dragData.scale = scale;
};

defineExpose({ setActive, setPos, setScale });
</script>

<style lang="scss">
.editor-drag-resize {
  .editor-drag-resize__inner {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
