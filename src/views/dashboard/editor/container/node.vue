<template lang="pug">
DragResize(class="middle-node" ref="resize" :data="dargDataset" @resizing="onResizing" @mousedown.stop.prevent="onDown")
  div.middle-node( ref="vm")

</template>

<script setup lang="ts">
import DragResize from './components/drag-resize.vue';
import { ref, reactive, markRaw, readonly, withDefaults, watch, onMounted } from 'vue';
import type { DargDataset } from '@d/darg-resize/interface';
import { useNodeContext } from './../hooks/node-context';
import { useComponentContext } from './../hooks/component-context';
import type { ComponentProps } from './../hooks/component-context/interface';

interface Props {
  id: string;
}
const props = withDefaults(defineProps<Props>(), {
  id: ''
});

const { getNode, updateNode, onSelectNode, addNodeInstance } = useNodeContext();
const node = getNode(props.id);

const dargDataset = readonly(
  reactive<DargDataset>(
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
addNodeInstance(node.id, { setActive, updatePos });

const onDown = function (): void {
  onSelectNode(node.id);
};

const onResizing = function (dargDataset: DargDataset): void {
  updateNode(node.id, {
    x: dargDataset.x,
    y: dargDataset.y,
    width: dargDataset.x2 - dargDataset.x,
    height: dargDataset.y2 - dargDataset.y
  });
};

const { createNodeComponent } = useComponentContext();
const vm = ref<HTMLElement>();
onMounted(() => {
  createNodeComponent(node.props as ComponentProps, vm?.value, node.component);
});
</script>

<style lang="scss">
#editor {
  .middle-node {
  }
}
</style>
