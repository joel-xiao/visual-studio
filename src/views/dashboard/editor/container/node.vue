<template lang="pug">
DragResize(ref="resize" :data="dargDataset" @resizing="onResizing" @mousedown.stop.prevent="onDown")
  div.node( ref="vm")

</template>

<script setup lang="ts">
import DragResize from './components/drag-resize.vue';
import {
  ref,
  reactive,
  inject,
  markRaw,
  readonly,
  withDefaults,
  createApp,
  watch,
  onMounted
} from 'vue';
import type { DargDataset } from '@d/darg-resize/interface';
import { useNodeContext } from './../hooks/node-context';

interface Props {
  id: string;
}
const props = withDefaults(defineProps<Props>(), {
  id: ''
});

const { getNode, onUpdateNode, onSelectNode, addNodeVm } = useNodeContext();
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
addNodeVm(node.id, { setActive });

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

const initNodeVm = function (el: HTMLElement | undefined): void {
  if (el) {
    const path = './ui-library/controls/picture/index.vue';
    const component = import.meta.glob(`./ui-library/controls/picture/index.vue`);
    let app = createApp(component[path], {});
    console.log(node.vm);
    let divEl = document.createElement('div');
    el.appendChild(divEl);
    // app.mount(divEl);
    el = undefined;
  }
};

const vm = ref<HTMLElement>();
onMounted(() => {
  initNodeVm(vm.value);
});
</script>

<style lang="scss" scoped>
.node {
}
</style>
