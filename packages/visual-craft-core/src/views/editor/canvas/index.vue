<template>
<div
  id="editor-canvas"
  ref="middleEl"
  class="editor-canvas"
  @drop="onDrop"
  @dragenter="onDragenter"
  @dragover="onDragover"
  @contextmenu.stop.prevent="showCanvasMenu($event, nodeContext, componentContext, getScale())"
>
  <div id="editor-canvas-root" ref="canvasRootEl" class="editor-canvas-root" :style="rootStyle" @mousedown.stop="onDown">
    <GridLine />
    <template v-for="item in nodes" :key="item.id">
      <CanvasNode :id="item.id" />
    </template>
    <MarqueeSelect />
    <SelectionBox />
  </div>
</div>
</template>

<script setup lang="ts">
import GridLine from './widgets/grid-line.vue';
import CanvasNode from './node.vue';
import MarqueeSelect from './widgets/marquee-select.vue';
import SelectionBox from './widgets/selection-box.vue';
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useCanvas, removeCanvas } from '../hooks/canvas';
import { useNodeContext } from './../hooks/node-context';
import { getRootStyle } from './../hooks/node-context/style';
import { useComponentContext } from './../hooks/component-context';
import { useRuler } from './../hooks/ruler-context';
import { useMarqueeSelect } from '../hooks/node-context/marquee-select';
import { useNodeMenu } from '../hooks/context-menu';
import { useKeyboardShortcuts } from '../hooks/node-context/shortcuts';

// interface Props {}
// const props = withDefaults(defineProps<Props>(), {});

const middleEl = ref<HTMLElement>();
const canvasRootEl = ref<HTMLElement>();

const nodeContext = useNodeContext();
const componentContext = useComponentContext();
const { getRootRef, getNodes, onSelectNode, onAddNode, onSelectNodes, searchNodesInArea } = nodeContext;

// Use Canvas
const canvasContext = useCanvas();
const { addScaleEvent, overlay, shortcuts, drag, getScale } = canvasContext;
const { addOverlayMoveUpdated, overlayUpdatePos, addOverlay, setOverlayDisabled } = overlay;

const { showCanvasMenu } = useNodeMenu();

useKeyboardShortcuts(nodeContext);
const { onMouseDown: onMarqueeMouseDown } = useMarqueeSelect(canvasRootEl, {
  searchNodesInArea,
  onSelect: onSelectNodes,
  getScale
});
const nodes = getNodes();
const root = getRootRef();
const rootStyle = getRootStyle(root);

const onDown = function (e: MouseEvent): void {
  onSelectNode(root.value.id);
  onMarqueeMouseDown(e);
};



onMounted(() => {
  nextTick(() => {
    addOverlay({
      parentEl: middleEl.value as HTMLElement,
      canvasEl: canvasRootEl.value as HTMLElement,
      key: 'editor-canvas-overlay'
    });

    addScaleEvent({
      parentEl: middleEl.value as HTMLElement,
      canvasEl: canvasRootEl.value as HTMLElement
    });

    overlayUpdatePos();
  });
});

onBeforeUnmount(() => {
});

const { setRulerPos } = useRuler();
addOverlayMoveUpdated(pos => {
  setRulerPos(pos);
});

const { addBindKeysUpdated } = shortcuts;
addBindKeysUpdated(bindKeys => {
  setOverlayDisabled(!bindKeys.isSpace);
});

const { onDragenter, onDragover, dropHandler } = drag;

const { getComponentProps } = useComponentContext();
const onDrop = function (event: DragEvent): void {
  dropHandler(event, (newNode, pos) => {
    const rect = canvasRootEl.value?.getBoundingClientRect() || { x: 0, y: 0 };
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
#visual-craft-core {
  .editor-canvas {
    z-index: 0;
    position: absolute;
    top: calc(var(--db-editor-nav-bar-height) + var(--db-editor-tool-bar-height));
    left: var(--db-editor-left-menu-width);
    right: var(--db-editor-right-menu-width);
    bottom: 0px;
    background-color: var(--db-editor-color-canvas-bg);
    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 20px 20px;

    .editor-canvas-root {
      position: absolute;
      background-color: var(--db-editor-color-root-bg);
    }

    .editor-canvas-root-mask {
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
