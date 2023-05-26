<template lang="pug">
div.editor-container(
  ref="middleEl"
  id="editor-container"
  @drop="onDrop"
  @dragenter="onDragenter"
  @dragover="onDragover"
  @mousewheel="onWheel"
  )
  div.editor-container-root(
    ref="containerEl"
    id="editor-container-root"
    :style="rootStyle"
    @mousedown.self="onDown")
    GridLine
    ContainerNode(v-for="(node, idx) in nodes" :key="node.id" :id="node.id")
</template>

<script setup lang="ts">
import GridLine from './components/grid-line.vue';
import ContainerNode from './node.vue';
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useDrag } from './../hooks/drag-context';
import { useNodeContext } from './../hooks/node-context';
import { useComponentContext } from './../hooks/component-context';
import { useBindKeysContext } from './../hooks/bind-keys-context';
import { useRuler } from './../hooks/ruler-context';
import { removeContainer, useContainer } from './mixins/container';

// interface Props {}
// const props = withDefaults(defineProps<Props>(), {});

const { getRoot, getNodes, getRootStyle, onSelectNode, onAddNode } = useNodeContext();
const nodes = getNodes();
const root = getRoot();
const rootStyle = getRootStyle();

const onDown = function (): void {
  onSelectNode(root.id);
};

const middleEl = ref<HTMLElement>();
const containerEl = ref<HTMLElement>();

// Create Container Mixin
let { addScaleEvent, addMoveEvent, addMoveUpdated, setOverlayDisabled } = useContainer();
onMounted(() => {
  addScaleEvent({
    parentEl: middleEl.value as HTMLElement,
    containerEl: containerEl.value as HTMLElement
  });

  addMoveEvent({
    parentEl: middleEl.value as HTMLElement,
    containerEl: containerEl.value as HTMLElement
  });
});

onBeforeUnmount(() => {
  removeContainer();
});

const { setRulerTranslate, setRulerScale, setRulerScaleTranslateDelta } = useRuler();
addMoveUpdated((pos) => {
  setRulerTranslate(pos);
});

const { addBindKeysUpdated } = useBindKeysContext();
addBindKeysUpdated((bindKeys) => {
  setOverlayDisabled(!bindKeys.isSpace);
});

const { onDragenter, onDragover, dropHandler } = useDrag();

const { getComponentProps } = useComponentContext();
const onDrop = function (event: DragEvent): void {
  dropHandler(event, (node, pos) => {
    const rect = containerEl.value?.getBoundingClientRect() || { x: 0, y: 0 };
    onAddNode(
      {
        ...node,
        props: getComponentProps(node.schema)
      },
      'root',
      { x: pos.x - rect.x, y: pos.y - rect.y }
    );
  });
};
</script>

<style lang="scss">
#editor {
  .editor-container {
    z-index: 0;
    position: absolute;
    top: calc(var(--db-editor-nav-bar-height) + var(--db-editor-tool-bar-height));
    left: var(--db-editor-left-menu-width);
    right: var(--db-editor-right-menu-width);
    bottom: 0px;
    background-color: var(--db-editor-color-canvas-bg);
    .editor-container-root {
      position: absolute;
      background-color: var(--db-color-bg-dark);
    }
    .editor-container-root-mask {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      cursor: grab;
      &.down {
        cursor: grabbing;
      }
    }
  }
}
</style>
