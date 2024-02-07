<template lang="pug">
DragResize(ref="resize" :data="dragDataset" @resizing="onResizing" @mousedown.stop.prevent="onDown")
  div.middle-node( ref="vm" :style="nodeStyle")

</template>

<script setup lang="ts">
import DragResize from './components/drag-resize.vue';
import { ref, reactive, markRaw, readonly, withDefaults, watch, onMounted } from 'vue';
import type { DragDataset } from '@d/drag-resize/interface';
import { useNodeContext } from './../hooks/node-context';
import { useComponentContext } from './../hooks/component-context';
import type { ComponentProps } from './../hooks/component-context/interface';
import { useContainer } from '../hooks/container';

interface Props {
  id: string;
}
const props = withDefaults(defineProps<Props>(), {
  id: ''
});

const { getNode, getNodeStyle, updateNode, onSelectNode, addNodeInstance } = useNodeContext();
const node = getNode(props.id);
const nodeStyle = getNodeStyle(props.id);

const { getScale, addContainerUpdated } = useContainer();
const dragDataset = readonly(
  reactive<DragDataset>(
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

addContainerUpdated(setScale);
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

const onResizing = function (dragDataset: DragDataset): void {
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
  createNodeComponentApp(node.props as ComponentProps, vm?.value, node.component);
});
</script>

<style lang="scss"></style>
