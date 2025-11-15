<template lang="pug">
div.editor-container(
  ref="middleEl"
  id="editor-container"
  @drop="onDrop"
  @dragenter="onDragenter"
  @dragover="onDragover"
  )
  div.editor-container-root(
    ref="containerEl"
    id="editor-container-root"
    :style="rootStyle"
    @mousedown.stop.prevent="onDown")
    GridLine(@mousedown.stop.prevent="onDown")
    ContainerNode(v-for="(node, idx) in nodes" :key="node.id" :id="node.id")
</template>

<script setup lang="ts">
import GridLine from './components/grid-line.vue';
import ContainerNode from './node.vue';
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useDrag } from './../hooks/drag-context';
import { useNodeContext } from './../hooks/node-context';
import { getRootStyle } from './../hooks/node-context/example';
import { useComponentContext } from './../hooks/component-context';
import { useBindKeysContext } from './../hooks/bind-keys-context';
import { useRuler } from './../hooks/ruler-context';
import { useOverlay } from './../hooks/overlay-context';
import { removeContainer, useContainer } from '../hooks/container';

// interface Props {}
// const props = withDefaults(defineProps<Props>(), {});

const { getRoot, getNodes, onSelectNode, onAddNode } = useNodeContext();
const nodes = getNodes();
const root = getRoot();
const rootStyle = getRootStyle(root as INode);

const onDown = function (): void {
  onSelectNode(root.id);
};

const middleEl = ref<HTMLElement>();
const containerEl = ref<HTMLElement>();

// Use Overlay Hook
const { addOverlayMoveUpdated, overlayUpdatePos, addOverlay, setOverlayDisabled } = useOverlay();

// Use Container Mixin
const { addScaleEvent, getScale } = useContainer();

onMounted(() => {
  addScaleEvent({
    parentEl: middleEl.value as HTMLElement,
    containerEl: containerEl.value as HTMLElement
  });

  addOverlay({
    parentEl: middleEl.value as HTMLElement,
    containerEl: containerEl.value as HTMLElement,
    key: 'editor-container-overlay'
  });

  overlayUpdatePos();
});

onBeforeUnmount(() => {
  removeContainer();
});

const { setRulerPos } = useRuler();
addOverlayMoveUpdated(pos => {
  setRulerPos(pos);
});

const { addBindKeysUpdated } = useBindKeysContext();
addBindKeysUpdated(bindKeys => {
  setOverlayDisabled(!bindKeys.isSpace);
});

const { onDragenter, onDragover, dropHandler } = useDrag();

const { getComponentProps } = useComponentContext();
const onDrop = function (event: DragEvent): void {
  dropHandler(event, (newNode, pos) => {
    const rect = containerEl.value?.getBoundingClientRect() || { x: 0, y: 0 };
    const scale = getScale();
    const node = onAddNode(
      {
        ...newNode,
        props: getComponentProps(newNode.schema)
      },
      'root',
      { x: (pos.x - rect.x) / scale, y: (pos.y - rect.y) / scale }
    );

    nextTick(() => {
      if (node) {
        onSelectNode(node.id);
      }
    });
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
      background-color: var(--db-editor-color-root-bg);
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
