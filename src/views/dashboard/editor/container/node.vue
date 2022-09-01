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
import { storeToRefs } from 'pinia';
import type { Node, NodeDelta } from './../interface';
import type { DargDataset } from '@d/darg-resize/interface';
import { divide } from 'lodash';
interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: ''
});

let getNode = inject('getNode');
const node: Node = typeof getNode === 'function' ? getNode(props.id) : {};

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

watch(
  () => node.select,
  (val: boolean | undefined): void => {
    resize?.value?.setActive(val);
  }
);

const updateNode = inject('updateNode');
const onUpdateNode = function (node: Node, delta: NodeDelta): void {
  typeof updateNode === 'function' && updateNode(node.id, delta);
};

let selectNode = inject('selectNode');
const onSelectNode = function (node: Node): void {
  typeof selectNode === 'function' && selectNode(node.id);
};

const onDown = function (): void {
  onSelectNode(node);
};

const onResizing = function (dargDataset: DargDataset): void {
  onUpdateNode(node, {
    x: dargDataset.x,
    y: dargDataset.y,
    width: dargDataset.x2 - dargDataset.x,
    height: dargDataset.y2 - dargDataset.y
  });
};

const initNodeVm = function (el: HTMLElement | undefined): void {
  // console.log(el);
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
