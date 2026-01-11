<template>
  <div v-if="selectedNodes.length > 1" class="selection-box-wrapper">
    <DragResize
      ref="resizeRef"
      :data="boundingBox"
      :disabled="isAllLocked"
      @resizing="onResizing"
      @drag-start="onDragStart"
      @mousedown.stop
      @contextmenu.stop.prevent="onContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, unref, onMounted, nextTick } from 'vue';
import DragResize from './drag-resize.vue';
import { useNodeContext } from '../../hooks/node-context';
import { useCanvas } from '../../hooks/canvas';
import { useComponentContext } from '../../hooks/component-context';
import { useNodeMenu } from '../../hooks/context-menu';

const nodeContext = useNodeContext();
const { getSelectedNodes, updateNode, setNodesSelection } = nodeContext;
const selectedNodes = getSelectedNodes();
const { getScale, addCanvasUpdated } = useCanvas();
const componentContext = useComponentContext();
const { showNodeMenu } = useNodeMenu();

const resizeRef = ref<InstanceType<typeof DragResize> | null>(null);
const isAllLocked = computed(() => {
  return selectedNodes.value.length > 0 && selectedNodes.value.every(n => n.lock);
});

// Bounding box state
const boundingBox = ref<IDragDataset>({ x: 0, y: 0, x2: 0, y2: 0 });

// Interaction selection highlight tracking
let previousSelectionIds: string[] = [];

// Record initial state when drag/resize starts
interface NodeInitialState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  leftRatio: number;
  topRatio: number;
  widthRatio: number;
  heightRatio: number;
}

let initialNodesState: NodeInitialState[] = [];

const calculateBoundingBox = async () => {
  const nodes = unref(selectedNodes).filter(n => !n.hide);
  if (nodes.length <= 1) {
    boundingBox.value = { x: 0, y: 0, x2: 0, y2: 0 };
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });

  boundingBox.value = { x: minX, y: minY, x2: maxX, y2: maxY };

  await nextTick();
  resizeRef.value?.setPos(boundingBox.value);
  resizeRef.value?.setActive(true);
};

// Initial calculation and watch for selection changes
watch(selectedNodes, (newVal) => {
  if (newVal.length > 1) {
    calculateBoundingBox();
    const ids = newVal.map(n => n.id);
    setNodesSelection(ids, true);
    previousSelectionIds = ids;
  } else if (previousSelectionIds.length > 0) {
    setNodesSelection(previousSelectionIds, false);
    previousSelectionIds = [];
  }
}, { immediate: true, deep: true });

onMounted(async () => {
  await nextTick();
  setScale();
  if (selectedNodes.value.length > 1) {
    calculateBoundingBox();
  }
});

// Listen to scale changes
function setScale() {
  resizeRef.value?.setScale(getScale());
}
addCanvasUpdated(setScale);

const onDragStart = () => {
  const b = boundingBox.value;
  const bw = b.x2 - b.x;
  const bh = b.y2 - b.y;

  initialNodesState = selectedNodes.value.map(node => ({
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    leftRatio: bw === 0 ? 0 : (node.x - b.x) / bw,
    topRatio: bh === 0 ? 0 : (node.y - b.y) / bh,
    widthRatio: bw === 0 ? 0 : node.width / bw,
    heightRatio: bh === 0 ? 0 : node.height / bh
  }));
};

const onResizing = (newBox: IDragDataset) => {
  const nbw = newBox.x2 - newBox.x;
  const nbh = newBox.y2 - newBox.y;

  initialNodesState.forEach(state => {
    const node = nodeContext.getNodeMap().get(state.id);
    if (node?.lock) return;

    updateNode(state.id, {
      x: newBox.x + state.leftRatio * nbw,
      y: newBox.y + state.topRatio * nbh,
      width: state.widthRatio * nbw,
      height: state.heightRatio * nbh
    });
  });

  boundingBox.value = { ...newBox };
};

const onContextMenu = (e: MouseEvent) => {
  const ids = selectedNodes.value.map(n => n.id);
  const nodeId = ids[0] || 'root';
  showNodeMenu(e, nodeId, nodeContext, componentContext, getScale());
};
</script>

<style lang="scss">
.selection-box-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999999; // Same as active handles
  pointer-events: none;

  .editor-drag-resize {
    pointer-events: all;
  }
}
</style>
