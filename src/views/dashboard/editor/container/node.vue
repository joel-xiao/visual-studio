<template lang="pug">
DragResize(class="middle-node" ref="resize" :data="dargDataset" @resizing="onResizing" @mousedown.stop.prevent="onDown")
  div.middle-node( ref="vm")

</template>

<script setup lang="ts">
import DragResize from './components/drag-resize.vue';
import { ref, reactive, markRaw, readonly, withDefaults, watch, onMounted } from 'vue';
import type { DargDataset } from '@d/darg-resize/interface';
import { useNodeContext } from './../hooks/node-context';
import { useUiLibraryContext } from './../hooks/ui-library-context';

interface Props {
  id: string;
}
const props = withDefaults(defineProps<Props>(), {
  id: ''
});

const { getNode, onUpdateNode, onSelectNode, addNodeInstance, createNodeComponent } =
  useNodeContext();
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

const setActive = function setActive(val: boolean | undefined) {
  resize?.value?.setActive(val);
};
addNodeInstance(node.id, { setActive });

const onDown = function (): void {
  onSelectNode(node.id);
};

const onResizing = function (dargDataset: DargDataset): void {
  onUpdateNode(node.id, {
    x: dargDataset.x,
    y: dargDataset.y,
    width: dargDataset.x2 - dargDataset.x,
    height: dargDataset.y2 - dargDataset.y
  });
};

const { getComponent } = useUiLibraryContext();
const vm = ref<HTMLElement>();
onMounted(() => {
  createNodeComponent(node, vm.value, getComponent(node.component));
});
</script>

<style lang="scss">
#editor {
  .middle-node {
  }
}
</style>
