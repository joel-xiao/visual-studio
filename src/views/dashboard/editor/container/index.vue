ya
<template lang="pug">
div.editor-middle(
  ref="middleDom"
  id="editor-middle"
  )
  div.editor-middle-container(
    id="editor-middle-container"
    :style="rootStyle"
    @drop="onDrop"
    @dragenter="onDragenter"
    @dragover="onDragover"
    @mousewheel="onWheel"
    @mousedown.self="onDown")
    GridLine
    |{{nodes.length}}
    ContainerNode(v-for="(node, idx) in nodes" :key="node.id" :id="node.id")
  div(class="editor-middle-container-mask" :class="middleClass" v-show="comBindKeys.isSpace" @mousedown="onMaskDown")

</template>

<script setup lang="ts">
import GridLine from './grid-line.vue';
import ContainerNode from './node.vue';
import type { Node, AddNode } from './../interface';
import { useDashboardStore } from '@/store/dashboard';
import { ref, inject, reactive, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

interface Props {
  nodes: Node[];
}
const props = withDefaults(defineProps<Props>(), {
  nodes: () => []
});

const { currentNode, comBindKeys } = storeToRefs(useDashboardStore());

let getRoot = inject('getRoot');
const root: Node = typeof getRoot === 'function' ? getRoot() : {};

let selectNode = inject('selectNode');
const onSelectNode = function (node: Node): void {
  typeof selectNode === 'function' && selectNode(node.id);
};

const onDown = function (): void {
  onSelectNode(root);
};

interface MiddlePos {
  x: number;
  y: number;
}
const middle = reactive<{ down: boolean }>({ down: false });
const middleDefaultPos = reactive<MiddlePos>({ x: root.x, y: root.y });
const middlePos = reactive<MiddlePos>({ ...middleDefaultPos });
const middleStartPos = reactive<MiddlePos>({ x: 0, y: 0 });

const rootStyle = computed<{ transform: string; width: string; height: string }>(() => {
  return {
    transform: `translate(${root.x + middlePos.x}px, ${root.y + middlePos.y}px)`,
    width: root.width + 'px',
    height: root.height + 'px'
  };
});

const middleDom = ref<HTMLElement>();
const initMiddle = function (): void {
  let middleRect: DOMRect | { width: number; height: number } =
    middleDom.value?.getBoundingClientRect() || {
      width: root.width,
      height: root.height
    };
  middleDefaultPos.x = (middleRect.width - root.width) / 2;
  if (middleDefaultPos.x < 0) middleDefaultPos.x = 0;
  middleDefaultPos.y = (middleRect.height - root.height) / 2;
  if (middleDefaultPos.y < 0) middleDefaultPos.y = 0;
  middlePos.x = middleDefaultPos.x;
  middlePos.y = middleDefaultPos.y;
};
onMounted(() => {
  initMiddle();
});

const middleClass = computed(() => ({
  down: middle.down
}));

const onMaskMove = function (event: MouseEvent): void {
  event.preventDefault();
  middlePos.x = middleDefaultPos.x + (event.x - middleStartPos.x);
  middlePos.y = middleDefaultPos.y + (event.y - middleStartPos.y);
};

const onMaskUp = function (event: MouseEvent): void {
  event.preventDefault();
  middle.down = false;
  onMaskMove(event);
  middleDefaultPos.x = middlePos.x;
  middleDefaultPos.y = middlePos.y;

  document.documentElement.removeEventListener('mousemove', onMaskMove, false);
  document.documentElement.removeEventListener('mouseup', onMaskUp), false;
  document.documentElement.removeEventListener('mouseleave', onMaskUp, false);
};

const onMaskDown = function (event: MouseEvent): void {
  event.preventDefault();
  middle.down = true;
  middleStartPos.x = event.x;
  middleStartPos.y = event.y;

  document.documentElement.addEventListener('mousemove', onMaskMove, false);
  document.documentElement.addEventListener('mouseup', onMaskUp), false;
  document.documentElement.addEventListener('mouseleave', onMaskUp, false);
};

const wheelData = computed<{ x: number; y: number }>(() => {
  return {
    x: 0,
    y: 0
  };
});

const onWheel = function (event: WheelEvent): void {
  console.log(event);
};

let addNode = inject('addNode');
const onAddNode = function (node: AddNode | undefined) {
  typeof addNode === 'function' && addNode(node);
};

const onDrop = function (event: DragEvent): void {
  let data: string | null | undefined = event.dataTransfer?.getData('component');
  let node: { name: string; id: string; icon: string } = (data && JSON.parse(data)) || {
    name: '',
    id: '',
    icon: ''
  };
  if (node) {
    onAddNode({
      name: node?.name,
      key: node?.id
    });
  }
};

const onDragenter = function (event: DragEvent): void {
  event.preventDefault();
};

const onDragover = function (event: DragEvent): void {
  event.preventDefault();
};
</script>

<style lang="scss" scoped>
.editor-middle {
  z-index: 0;
  position: absolute;
  top: calc(var(--nav-bar-height) + var(--tool-bar-height));
  left: var(--left-menu-width);
  right: var(--right-menu-width);
  bottom: 0px;
  background-color: var(--theme-color-canvas-bg);
  .editor-middle-container {
    position: absolute;
    background-color: var(--color-bg-dark);
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
</style>
