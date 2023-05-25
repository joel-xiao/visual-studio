<template lang="pug">
div.editor-middle(
  ref="middleEl"
  id="editor-middle"
  @drop="onDrop"
  @dragenter="onDragenter"
  @dragover="onDragover"
  @mousewheel="onWheel"
  )
  div.editor-middle-container(
    ref="containerEl"
    id="editor-middle-container"
    :style="rootStyle"
    @mousedown.self="onDown")
    GridLine
    ContainerNode(v-for="(node, idx) in nodes" :key="node.id" :id="node.id")
</template>

<script setup lang="ts">
import GridLine from './components/grid-line.vue';
import ContainerNode from './node.vue';
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useDrag } from './../hooks/drag-context';
import { useNodeContext } from './../hooks/node-context';
import { useComponentContext } from './../hooks/component-context';
import { useBindKeysContext } from './../hooks/bind-keys-context';
import { useRuler } from './../hooks/ruler';
import { createMiddleMask, useMiddle } from './../hooks/middle';

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
const middleMask = createMiddleMask(middleEl, containerEl, 'editor-middle-mask');

const { setRulerTranslate, setRulerScale, setRulerScaleTranslateDelta } = useRuler();
const { addMiddleMoveUpdated, setMiddleScale, setMiddleScaleOffset, getMiddleScaleOffset } =
  useMiddle();
addMiddleMoveUpdated((pos) => {
  setRulerTranslate(pos);
});

const { addBindKeysUpdated, getBindKeys } = useBindKeysContext();
addBindKeysUpdated((bindKeys) => {
  middleMask?.setDisabled(!bindKeys.isSpace);
});

const wheelData = computed<{ x: number; y: number }>(() => {
  return {
    x: 0,
    y: 0
  };
});

let scale = 1;
const onWheel = function (e: WheelEvent): void {
  e.preventDefault();
  let { isCtrl } = getBindKeys();
  if (isCtrl) {
    let ratio = 1.1;
    if (e.deltaY > 0) {
      ratio = 0.9;
    }
    scale = scale * ratio;
    let ratio_scale = ratio - 1;
    const origin = {
      x: ratio_scale * root.width * 0.5,
      y: ratio_scale * root.height * 0.5
    };
    let { x, y } = getMiddleScaleOffset();
    x -= ratio_scale * (e.clientX - x - (window.innerWidth - root.width) * 0.5) - origin.x;
    y -= ratio_scale * (e.clientY - y - (window.innerHeight - root.height) * 0.5) - origin.y;
    setMiddleScaleOffset({ x, y });
    // setMiddleScale(scale);
    if (containerEl.value) {
      containerEl.value.style.scale = `${scale}`;
    }
  }
};

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
  .editor-middle {
    z-index: 0;
    position: absolute;
    top: calc(var(--db-editor-nav-bar-height) + var(--db-editor-tool-bar-height));
    left: var(--db-editor-left-menu-width);
    right: var(--db-editor-right-menu-width);
    bottom: 0px;
    background-color: var(--db-editor-color-canvas-bg);
    .editor-middle-container {
      position: absolute;
      background-color: var(--db-color-bg-dark);
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
