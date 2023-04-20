<template lang="pug">
div.editor-middle(
  ref="middleDom"
  id="editor-middle"
  @drop="onDrop"
  @dragenter="onDragenter"
  @dragover="onDragover"
  @mousewheel="onWheel"
  )
  div.editor-middle-container(
    ref="middleContainerDom"
    id="editor-middle-container"
    :style="rootStyle"
    @mousedown.self="onDown")
    GridLine
    ContainerNode(v-for="(node, idx) in nodes" :key="node.id" :id="node.id")
</template>

<script setup lang="ts">
import GridLine from './components/grid-line.vue';
import ContainerNode from './node';
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useDrag } from './../hooks/drag-context';
import { useNodeContext } from './../hooks/node-context';
import type { Node } from './../hooks/node-context/interface';
import { useComponentContext } from './../hooks/component-context';
import { useBindKeysContext } from './../hooks/bind-keys-context';
import { createMiddleMask } from './../hooks/middle';

interface Props {
  nodes: Node[];
}
const props = withDefaults(defineProps<Props>(), {
  nodes: () => []
});

const { addBindKeysUpdated } = useBindKeysContext();

const { getRoot, getRootStyle, onSelectNode, onAddNode } = useNodeContext();
const root = getRoot();
const rootStyle = getRootStyle();

const onDown = function (): void {
  onSelectNode(root.id);
};

const middleDom = ref<HTMLElement>();
const middleContainerDom = ref<HTMLElement>();
const middleMask = createMiddleMask(middleDom, middleContainerDom, 'editor-middle-mask');
addBindKeysUpdated((bindKeys) => {
  middleMask?.setDisabled(!bindKeys.isSpace);
});

const wheelData = computed<{ x: number; y: number }>(() => {
  return {
    x: 0,
    y: 0
  };
});

const onWheel = function (event: WheelEvent): void {
  console.log(event);
};

const { onDragenter, onDragover, dropHandler } = useDrag();

const { getComponentProps } = useComponentContext();
const onDrop = function (event: DragEvent): void {
  dropHandler(event, (node, pos) => {
    const rect = middleContainerDom.value?.getBoundingClientRect() || { x: 0, y: 0 };
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
  .editor-middle {
    z-index: 0;
    position: absolute;
    top: calc(var(--nav-bar-height) + var(--tool-bar-height));
    left: var(--left-menu-width);
    right: var(--right-menu-width);
    bottom: 0px;
    background-color: var(--theme-color-canvas-bg);
    .editor-middle-container {
      position: absolute;
      background-color: var(--color-bg-dark);
    }
    .editor-middle-container-mask {
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
