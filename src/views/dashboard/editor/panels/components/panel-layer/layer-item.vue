<script lang="ts" setup>
import { ref, reactive, defineEmits, defineProps, withDefaults } from 'vue';
import type { LayerItemData, LayerItemMenu } from './interface';

interface Props {
  recursion?: number;
  data?: LayerItemData[];
  itemIcon?: string;
  itemMenus: LayerItemMenu[];
  currentNav?: LayerItemData | null;
}

const props = withDefaults(defineProps<Props>(), {
  recursion: 0,
  data: () => [],
  itemIcon: '',
  itemMenus: () => [],
  currentNav: null
});

const emit = defineEmits(['select', 'command']);

const onSelect = function (item: LayerItemData): void {
  emit('select', item);
};

const layerItemStyle: { paddingLeft?: string } = reactive({});
layerItemStyle.paddingLeft = 24 + props.recursion * 16 + 'px';

// const AFold = ref<boolean>(false);
const onArrow = function (item: LayerItemData): void {
  item.AFold = !item.AFold;
  // AFold.value = item.AFold;
};

const onCommand = function (event: PointerEvent, cmd: LayerItemMenu, item: LayerItemData): void {
  emit('command', event, cmd, item);
};
</script>
<template lang="pug">
.layer-item(v-for="item in data" :key="item.id" :class="{ 'layer-item_check': currentNav?.id === item.id }")
  .layer-item-nav(@click="onSelect(item)" :class="{ active: currentNav?.id === item.id }" :style="layerItemStyle")
    .layer-item-left
      Icon.arrow(block src="icon-zhankai" :class="{ active: item.AFold }" v-if="item?.children?.length" @click.stop="onArrow(item)")
      span.dot(v-else)
      Icon.name-icon( block v-if="item.icon || itemIcon" :src="item.icon || itemIcon")
      span.name-icon-margin(v-else)
      span.layer-item-labe {{ item.name }}
    .layer-item-handle(v-if="item.handle !== false")
      Icon(button v-for="cmd in itemMenus" :key="cmd.id" :class="cmd.id" @click.stop.prevent="onCommand($event, cmd, item)" :src="cmd.icon")
  .layer-item-swapper(v-if="!!item?.children?.length" v-show="item.AFold")
    LayerItem(:recursion="recursion + 1" @select="onSelect" @command="onCommand" :data="item.children" :itemIcon="itemIcon" :itemMenus="itemMenus" :currentNav="currentNav")
</template>

<style scoped lang="scss">
.layer-item {
  &.layer-item_check {
    background: var(--color-select-light);
    border-radius: 6px;
    overflow: hidden;
  }
  .layer-item-nav {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    padding-right: 4px;
    padding-left: 4px;
    overflow: hidden;
    color: var(--color-text-primary);
    border-radius: 6px;

    .layer-item-left {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .arrow {
        position: absolute;
        left: -20px;
        cursor: pointer;
        transition: transform 0.2s;
        transform: rotate(-90deg);
        opacity: 0.5;

        &.active {
          transform: rotate(0deg);
        }
      }

      .dot {
        position: absolute;
        left: -12px;
        width: 6px;
        height: 6px;
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

    .layer-item-handle {
      position: absolute;
      right: 0;
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 4px;
      opacity: 0;
      transition: opacity 0.15s;
    }

    &:hover,
    &.hover {
      background: var(--color-tran-6);

      .layer-item-left {
        .name-icon {
          color: var(--color-text-primary);
        }
      }

      .layer-item-handle {
        opacity: 1;
      }
    }

    &.active {
      background-color: var(--color-select);

      .layer-item-left {
        .name-icon {
          color: var(--color-text-bold);
        }
      }
    }
  }
}
</style>
