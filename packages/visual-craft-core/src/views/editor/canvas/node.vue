<template>
  <DragResize
    ref="resize"
    :data="dragDataset"
    @resizing="onResizing"
    @mousedown.stop.prevent="onDown"
    @contextmenu.stop.prevent="showNodeMenu($event, id, nodeContext, componentContext, getScale())"
  >
    <div ref="vm" class="middle-node" :style="nodeStyle"></div>
  </DragResize>
</template>

<script setup lang="ts">
import DragResize from './widgets/drag-resize.vue';
import { ref, reactive, markRaw, readonly, onMounted, unref } from 'vue';
import { useNodeContext } from './../hooks/node-context';
import { getNodeStyle } from './../hooks/node-context/style';
import { useComponentContext } from './../hooks/component-context';
import { useCanvas } from '../hooks/canvas';
import { useNodeMenu } from '../hooks/context-menu';

interface Props {
  id: string;
}
const props = withDefaults(defineProps<Props>(), { id: '' });

const nodeContext = useNodeContext();
const componentContext = useComponentContext();
const { getNode, onSelectNode, addNodeInstance, getSelectedNodes } = nodeContext;
const selectedNodes = getSelectedNodes();
const node = getNode(props.id);
const nodeStyle = getNodeStyle(node);
const allNodes = nodeContext.getNodes();

const { getScale, addCanvasUpdated } = useCanvas();
const { showNodeMenu } = useNodeMenu();
const dragDataset = readonly(
  reactive<IDragDataset>(
    markRaw({
      x: node.x || 0,
      y: node.y || 0,
      x2: node.x + node.width,
      y2: node.y + node.height
    })
  )
);
const resize = ref<null | InstanceType<typeof DragResize>>(null);

const setActive = (val: boolean | undefined) => resize?.value?.setActive(val);
const setSelection = (val: boolean | undefined) => resize?.value?.setSelection(val);
const updatePos = () => {
  resize?.value?.setPos({
    x: node.x || 0,
    y: node.y || 0,
    x2: node.x + node.width,
    y2: node.y + node.height
  });
};

const setScale = () => resize?.value?.setScale(getScale());
addCanvasUpdated(setScale);

onMounted(() => {
  setScale();
  createNodeComponentApp(node.props as IComponentProps, vm?.value, node.component);
});

addNodeInstance(node.id, { setActive, setSelection, updatePos });

const onDown = (e: MouseEvent) => onSelectNode(node.id, e.shiftKey);

const onResizing = (dragDataset: IDragDataset) => {
  const dx = dragDataset.x - node.x;
  const dy = dragDataset.y - node.y;
  const dw = dragDataset.x2 - dragDataset.x - node.width;
  const dh = dragDataset.y2 - dragDataset.y - node.height;

  if ((node as INode).lock) return;

  if (dw === 0 && dh === 0) {
    nodeContext.group.handleNodeDrag(node as INode, dx, dy, unref(allNodes) as INode[], unref(selectedNodes) as INode[]);
  } else {
    nodeContext.group.handleNodeResize(node as INode, dragDataset, unref(allNodes) as INode[]);
  }
};

const { createNodeComponentApp } = useComponentContext();
const vm = ref<HTMLElement>();
</script>

<style lang="scss"></style>
