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
import { computed, reactive, watch } from 'vue';
import { dragResizeDirective } from '../../../../directives/drag-resize';

const vDragResize = dragResizeDirective;

interface Props {
  data: IDragDataset;
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({ y2: 0, x2: 0, x: 0, y: 0 }),
  disabled: false
});

const emit = defineEmits<{
  (e: 'resizing', val: IDragDataset): void;
  (e: 'drag-start', val: IDragDataset): void;
}>();

const dragData = reactive<IDragResizeBinding>({
  pos: props.data,
  disabled: props.disabled,
  active: false,
  selection: false,
  scale: 1,
  onUp: (dragDataset: IDragDataset) => {
    emit('resizing', dragDataset);
  },
  onMove: (dragDataset: IDragDataset) => {
    emit('resizing', dragDataset);
  },
  onDown: (dragDataset: IDragDataset) => {
    emit('drag-start', dragDataset);
  }
});

watch(() => props.disabled, (val) => {
  dragData.disabled = !!val;
});

const dragDataComputed = computed<IDragResizeBinding>(() => ({ ...dragData }));

const setActive = function (val: boolean | undefined): void {
  dragData.active = !!val;
};

const setSelection = function (val: boolean | undefined): void {
  dragData.selection = !!val;
};

const setPos = function (pos: IDragDataset): void {
  dragData.pos = pos;
};

const setScale = function (scale: number) {
  dragData.scale = scale;
};

defineExpose({ setActive, setSelection, setPos, setScale });
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
