<template>
<DragResize ref="resize" :data="dragDataset" @resizing="onResizing" @mousedown.stop.prevent="onDown">
  <div ref="vm" class="middle-node" :style="nodeStyle"></div>
</DragResize>
</template>

<script setup lang="ts">
import DragResize from './widgets/drag-resize.vue';
import { ref, reactive, markRaw, readonly, withDefaults, watch, onMounted } from 'vue';
import { useNodeContext } from './../hooks/node-context';
import { getNodeStyle } from './../hooks/node-context/example';
import { useComponentContext } from './../hooks/component-context';
import { useCanvas } from '../hooks/canvas';

interface Props {
  id: string;
}
const props = withDefaults(defineProps<Props>(), {
  id: ''
});

const { getNode, updateNode, onSelectNode, addNodeInstance } = useNodeContext();
const node = getNode(props.id) as INode;
const nodeStyle = getNodeStyle(node);

const { getScale, addCanvasUpdated } = useCanvas();
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

const setActive = function (val: boolean | undefined) {
  resize?.value?.setActive(val);
};
const updatePos = function () {
  resize?.value?.setPos({
    x: node.x || 0,
    y: node.y || 0,
    x2: node.x + node.width,
    y2: node.y + node.height
  });
};

addCanvasUpdated(setScale);
function setScale() {
  resize?.value?.setScale(getScale());
}
onMounted(() => {
  setScale();
});

addNodeInstance(node.id, { setActive, updatePos });

const onDown = function (): void {
  onSelectNode(node.id);
};

const onResizing = function (dragDataset: IDragDataset): void {
  updateNode(node.id, {
    x: dragDataset.x,
    y: dragDataset.y,
    width: dragDataset.x2 - dragDataset.x,
    height: dragDataset.y2 - dragDataset.y
  });
};

const { createNodeComponentApp } = useComponentContext();
const vm = ref<HTMLElement>();
onMounted(() => {
  createNodeComponentApp(node.props as IComponentProps, vm?.value, node.component);
});
</script>

<style lang="scss"></style>
