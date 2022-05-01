<script lang="ts" setup>
import { ref, reactive, defineEmits, defineProps, withDefaults } from 'vue';
import type { TreeItemData, TreeItemMenu } from './interface';

interface Props {
  recursion?: number;
  data?: TreeItemData[];
  itemIcon?: string;
  itemMenus: TreeItemMenu[];
  currentNav?: TreeItemData | null;
}

const props = withDefaults(defineProps<Props>(), {
  recursion: 0,
  data: () => [],
  itemIcon: '',
  itemMenus: () => [],
  currentNav: null
});

const emit = defineEmits(['select', 'command']);

const onSelect = function (item: TreeItemData): void {
  emit('select', item);
};

const treeItemStyle: { paddingLeft?: string } = reactive({});
treeItemStyle.paddingLeft = 24 + props.recursion * 16 + 'px';

// const AFold = ref<boolean>(false);
const onArrow = function (item: TreeItemData): void {
  item.AFold = !item.AFold;
  // AFold.value = item.AFold;
};

const onCommand = function (event: PointerEvent, cmd: TreeItemMenu, item: TreeItemData): void {
  emit('command', event, cmd, item);
};
</script>
<template lang="pug">
.tree-item(v-for="item in data" :key="item.id")
  .tree-item-nav(@click="onSelect(item)" :class="{ active: currentNav?.id === item.id }" :style="treeItemStyle")
    .tree-item-left
      Icon.arrow(block src="icon-shouqi2" :class="{ active: item.AFold }" v-if="item?.children?.length" @click.stop="onArrow(item)")
      span.dot(v-else)
      Icon.name-icon( block v-if="item.icon || itemIcon" :src="item.icon || itemIcon")
      span.name-icon-margin(v-else)
      span.tree-item-labe {{ item.name }}
    .tree-item-handle(v-if="item.handle !== false")
      Icon(button v-for="cmd in itemMenus" :key="cmd.id" :class="cmd.id" @click.stop.prevent="onCommand($event, cmd, item)" :src="cmd.icon")
  .tree-item-swapper(v-if="!!item?.children?.length" v-show="item.AFold")
    TreeItem(:recursion="recursion + 1" @select="onSelect" @command="onCommand" :data="item.children" :itemIcon="itemIcon" :itemMenus="itemMenus" :currentNav="currentNav")
</template>

<style scoped lang="scss">
.tree-item {
  .tree-item-nav {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    padding-right: 4px;
    padding-left: 4px;
    margin: 4px 0;
    overflow: hidden;
    color: var(--color-tran-85);
    border-radius: var(--border-radius-6);

    .tree-item-left {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .arrow {
        position: absolute;
        left: -20px;
        cursor: pointer;
        transition: transform 0.2s;
        opacity: 0.6;

        &.active {
          transform: rotate(90deg);
        }
      }

      .dot {
        position: absolute;
        left: -12px;
        width: 8px;
        height: 8px;
        background: var(--color-tran-12);
        border-radius: 2px;
      }

      .name-icon {
        color: var(--color-tran-50);
      }

      .name-icon-margin {
        margin: 0 2px;
      }
    }

    .tree-item-handle {
      position: absolute;
      right: 0;
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 4px;
      opacity: 0;
      transition: opacity 0.15s;
    }

    &:hover {
      background-color: var(--theme-color-gray-100);

      .tree-item-left {
        .name-icon {
          color: var(--color-tran-85);
        }
      }

      .tree-item-handle {
        opacity: 1;
      }
    }

    &.active {
      background-color: var(--theme-color-gray-300);

      .tree-item-left {
        .name-icon {
          color: var(--color-text-bold);
        }
      }
    }
  }
}
</style>
