<script lang="ts" setup>
import { ref, reactive, withDefaults } from 'vue';

interface Props {
  recursion?: number;
  data?: PanelLayerItemData[];
  itemIcon?: string;
  itemMenus: PanelLayerItemMenu[];
}

const props = withDefaults(defineProps<Props>(), {
  recursion: 0,
  data: () => [],
  itemIcon: '',
  itemMenus: () => [],
  currentNav: null
});

const emit = defineEmits(['select', 'command']);

const onSelect = function (item: PanelLayerItemData): void {
  emit('select', item);
};

const layerItemStyle: { paddingLeft?: string } = reactive({});
layerItemStyle.paddingLeft = 24 + props.recursion * 16 + 'px';

const onArrow = function (item: PanelLayerItemData): void {
  item.AFold = !item.AFold;
};

const onCommand = function (
  event: PointerEvent,
  cmd: PanelLayerItemMenu,
  item: PanelLayerItemData
): void {
  emit('command', event, cmd, item);
};
</script>
<template>
  <div v-for="item in data" :key="item.id" class="layer-item" :class="{ 'layer-item_check': item.select }">
    <div class="layer-item-nav" :class="{ active: item.select }" :style="layerItemStyle" @click="onSelect(item)">
      <div class="layer-item-left">
        <Icon v-if="item?.children?.length" class="arrow" block src="icon-zhankai" :class="{ active: item.AFold }" @click.stop="onArrow(item)" />
        <span v-else class="dot"></span>
        <Icon v-if="item.icon || itemIcon" class="name-icon" block :src="item.icon || itemIcon" />
        <span v-else class="name-icon-margin"></span>
        <span class="layer-item-labe">{{ item.name }}</span>
      </div>
      <div v-if="item.handle !== false" class="layer-item-handle">
        <Icon v-for="cmd in itemMenus" :key="cmd.id" button :class="cmd.id" :src="cmd.icon" @click.stop.prevent="onCommand($event, cmd, item)" />
      </div>
    </div>
    <div v-if="!!item?.children?.length" v-show="item.AFold" class="layer-item-swapper">
      <LayerItem :recursion="recursion + 1" :data="item.children" :item-icon="itemIcon" :item-menus="itemMenus" @select="onSelect" @command="onCommand" />
    </div>
  </div>
</template>

<style lang="scss">
.editor-layer-tree {
  .layer-item {
    &.layer-item_check {
      background: var(--db-editor-color-select-light);
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
      color: var(--theme-color-text-primary);
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
          background: var(--theme-color-tran-12);
          border-radius: 2px;
        }

        .name-icon {
          color: var(--theme-color-tran-50);
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
        background: var(--theme-color-tran-6);

        .layer-item-left {
          .name-icon {
            color: var(--theme-color-text-primary);
          }
        }

        .layer-item-handle {
          opacity: 1;
        }
      }

      &.active {
        background-color: var(--db-editor-color-select);

        .layer-item-left {
          .name-icon {
            color: var(--theme-color-text-bold);
          }
        }
      }
    }
  }
}
</style>
