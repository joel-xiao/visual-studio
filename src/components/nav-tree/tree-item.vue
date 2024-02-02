<script lang="ts" setup>
import { ref, reactive, withDefaults, computed } from 'vue';
import type { TreeItemData, TreeItemMenu } from './interface';
import type { Size } from './../types.d';

interface Props {
  recursion?: number;
  data?: TreeItemData[];
  itemIcon?: string;
  itemMenus: TreeItemMenu[];
  size?: Size;
  currentNav?: TreeItemData | null;
}

const props = withDefaults(defineProps<Props>(), {
  recursion: 0,
  data: () => [],
  itemIcon: '',
  itemMenus: () => [],
  size: '',
  currentNav: null
});

const emit = defineEmits(['select', 'command']);

const onSelect = function (item: TreeItemData, isTop: boolean): void {
  if (!isTop) onArrow(item);
  emit('select', item);
};

const IsDot = computed(() => {
  return props.data.some((item) => item.children?.length);
});

const IsPrefix = computed(() => {
  return props.data.some((item) => !!item.prefix);
});

const IsArrow = function (item: TreeItemData) {
  return item?.children?.length;
};

const treeItemStyle: { paddingLeft?: string } = reactive({});
treeItemStyle.paddingLeft = (IsPrefix.value ? 10 : 24) + props.recursion * 16 + 'px';

// const AFold = ref<boolean>(false);
function onArrow(item: TreeItemData): void {
  item.AFold = !item.AFold;
  // AFold.value = item.AFold;
}

const onCommand = function (event: PointerEvent, cmd: TreeItemMenu, item: TreeItemData): void {
  emit('command', event, cmd, item);
};
</script>
<template lang="pug">
.tree-item(v-for="item in data" :key="item.id")
  .tree-item-nav(@click="onSelect(item)" :class="{ active: currentNav === item }" :style="treeItemStyle")
    .tree-item-left
      Icon.arrow(block src="icon-shouqi2" :size="size" :class="{ active: item.AFold }" v-if="IsArrow(item)" @click.stop="onArrow(item)")
      span.dot(v-else-if="IsDot")
      Icon.name-icon(block v-if="(item.icon || itemIcon) && !item.prefix" :src="item.icon || itemIcon")
      span(v-else-if="item.prefix" class="name-prefix" v-html="item.prefix")
      span.name-icon-margin(v-else)
      span.tree-item-labe {{ item.name }}
    .tree-item-handle(v-if="item.handle !== false")
      Icon(button :size="size" v-for="cmd in itemMenus" :key="cmd.id" :class="cmd.id" @click.stop.prevent="onCommand($event, cmd, item)" :src="cmd.icon")
  .tree-item-swapper(v-if="!!item?.children?.length" :class="{expand: item.AFold}" :style="{'--tree-item-sum': item?.children?.length || item?.children?.length}")
    TreeItem(:recursion="recursion + 1" :size="size" @select="onSelect($event, true)" @command="onCommand" :data="item.children" :itemIcon="itemIcon" :itemMenus="itemMenus" :currentNav="currentNav")
</template>

<style lang="scss">
.c-nav-tree {
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
      color: var(--theme-color-tran-85);
      border-radius: var(--border-radius-6);

      .tree-item-left {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        .arrow {
          position: absolute;
          left: -20px;
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
          background: var(--theme-color-tran-12);
          border-radius: 2px;
        }

        .name-icon {
          color: var(--theme-color-tran-50);
        }

        .name-prefix {
          padding: 0 6px;
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
            color: var(--theme-color-tran-85);
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
            color: var(--theme-color-text-bold);
          }
        }
      }
    }

    .tree-item-swapper {
      height: 0;
      opacity: 0.2;
      overflow: hidden;
      transition: 0.1s;
      &.expand {
        opacity: 1;
        height: 100%;
        overflow: auto;
        margin-top: -4px;
      }
    }
  }

  &.small {
    .tree-item {
      .tree-item-nav {
        height: 40px;
      }
    }
  }
}
</style>
