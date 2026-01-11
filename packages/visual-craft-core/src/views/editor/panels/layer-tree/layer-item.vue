<script lang="ts" setup>
import { ref, reactive } from 'vue';
import Icon from '@/components/icon/index.vue';

interface Props {
  recursion?: number;
  data?: readonly PanelLayerItemData[];
  itemIcon?: string;
  itemMenus: readonly PanelLayerItemMenu[];
  getIcon?: (item: PanelLayerItemData) => string;
  isInheritedHide?: (item: PanelLayerItemData) => boolean;
  isInheritedLock?: (item: PanelLayerItemData) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  recursion: 0,
  data: () => [],
  itemIcon: '',
  itemMenus: () => [],
});

const emit = defineEmits(['select', 'command', 'toggle-hide', 'toggle-lock', 'sort', 'contextmenu', 'toggle-fold']);

const hoverId = ref<string | null>(null);
const dragOverId = ref<string | null>(null);
const dropPos = ref<'before' | 'after' | 'inside' | null>(null);
const draggingId = ref<string | null>(null);

const layerItemStyle: { paddingLeft?: string } = reactive({});
layerItemStyle.paddingLeft = 24 + props.recursion * 16 + 'px';

const getItemIcon = (item: PanelLayerItemData): string => {
  if (item.icon) return item.icon;
  if (props.getIcon) {
    return props.getIcon(item);
  }
  return props.itemIcon;
};

// 选择图层
const onSelect = (e: MouseEvent, item: PanelLayerItemData): void => {
  emit('select', item.id, e.shiftKey, e.ctrlKey || e.metaKey);
};

// 展开/收起
const onArrow = (item: PanelLayerItemData): void => {
  emit('toggle-fold', item.id);
};

const onToggleHide = (item: PanelLayerItemData) => emit('toggle-hide', item.id);
const onToggleLock = (item: PanelLayerItemData) => emit('toggle-lock', item.id);

const onDragStart = (e: DragEvent, item: PanelLayerItemData) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    draggingId.value = item.id;
    (window as any)._draggingLayerId = item.id;
  }
};

const onDragEnd = () => {
  draggingId.value = null;
  dragOverId.value = null;
  dropPos.value = null;
  (window as any)._draggingLayerId = null;
};

const onDragOver = (e: DragEvent, item: PanelLayerItemData) => {
  const sourceId = (window as any)._draggingLayerId;
  if (!sourceId || sourceId === item.id) return;

  e.preventDefault();
  e.stopPropagation();

  dragOverId.value = item.id;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const y = e.clientY - rect.top;
  const threshold = rect.height * 0.25;

  if (y < threshold) {
    dropPos.value = 'before';
  } else if (y > rect.height - threshold) {
    dropPos.value = 'after';
  } else {
    // 简单逻辑：如果 schema 为 GROUP 则允许 inside，否则根据高度平分
    dropPos.value = item.schema === 'GROUP' ? 'inside' : (y > rect.height / 2 ? 'after' : 'before');
  }
};

const onDragLeave = (e: DragEvent) => {
  const related = e.relatedTarget as HTMLElement;
  if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
    dragOverId.value = null;
    dropPos.value = null;
  }
};

const onDrop = (e: DragEvent, item: PanelLayerItemData) => {
  e.preventDefault();
  e.stopPropagation();
  const sourceId = e.dataTransfer?.getData('text/plain');
  if (sourceId && dropPos.value && sourceId !== item.id) {
    emit('sort', sourceId, item.id, dropPos.value);
  }
  dragOverId.value = null;
  dropPos.value = null;
};
</script>

<template>
  <div v-for="item in data" :key="item.id" class="layer-item" :class="{ 'layer-item_check': item.select }">
    <div
      class="layer-item-nav"
      :class="{
        active: item.select,
        'is-hidden': item.data?.hide,
        'is-locked': item.data?.lock,
        'is-dragging': draggingId === item.id,
        'drop-before': dragOverId === item.id && dropPos === 'before',
        'drop-after': dragOverId === item.id && dropPos === 'after',
        'drop-inside': dragOverId === item.id && dropPos === 'inside',
      }"
      :style="layerItemStyle"
      draggable="true"
      @dragstart="onDragStart($event, item)"
      @dragend="onDragEnd"
      @dragover="onDragOver($event, item)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, item)"
      @click="onSelect($event, item)"
      @mouseenter="hoverId = item.id"
      @mouseleave="hoverId = null"
      @contextmenu.stop.prevent="emit('contextmenu', $event, item.id)"
    >
      <div class="layer-item-left">
        <Icon
          v-if="item?.children?.length"
          class="arrow"
          block
          src="icon-zhankai"
          :class="{ active: item.AFold }"
          @click.stop="onArrow(item)"
        />
        <span v-else class="dot"></span>
        <Icon v-if="getItemIcon(item)" class="name-icon" block :src="getItemIcon(item)" />
        <span v-else class="name-icon-margin"></span>
        <span class="layer-item-labe">{{ item.name }}</span>
      </div>

      <div v-if="item.handle !== false" class="layer-item-handle">
        <Icon
          v-if="hoverId === item.id || item.data?.lock"
          button
          class="lock-btn"
          :class="{ 'is-active': item.data?.lock }"
          :src="item.data?.lock ? 'lucide:lock' : 'lucide:unlock'"
          @click.stop.prevent="onToggleLock(item)"
        />
        <span v-else-if="props.isInheritedLock?.(item)" class="inherited-dot"></span>

        <Icon
          v-if="hoverId === item.id || item.data?.hide"
          button
          class="hide-btn"
          :class="{ 'is-active': item.data?.hide }"
          :src="item.data?.hide ? 'lucide:eye-off' : 'lucide:eye'"
          @click.stop.prevent="onToggleHide(item)"
        />
        <span v-else-if="props.isInheritedHide?.(item)" class="inherited-dot"></span>
      </div>
    </div>

    <div v-if="!!item?.children?.length" v-show="item.AFold" class="layer-item-swapper">
      <LayerItem
        :recursion="recursion + 1"
        :data="item.children"
        :item-icon="itemIcon"
        :item-menus="itemMenus"
        :get-icon="getIcon"
        :is-inherited-hide="isInheritedHide"
        :is-inherited-lock="isInheritedLock"
        @select="(id, shift, ctrl) => emit('select', id, shift, ctrl)"
        @toggle-hide="id => emit('toggle-hide', id)"
        @toggle-lock="id => emit('toggle-lock', id)"
        @sort="(s, t, p) => emit('sort', s, t, p)"
        @contextmenu="(e, id) => emit('contextmenu', e, id)"
        @toggle-fold="id => emit('toggle-fold', id)"
      />
    </div>
  </div>
</template>

<style lang="scss">
.editor-layer-tree {
  .layer-item {
    &.layer-item_check {
      // 1. 选中项本身的行高亮
      & > .layer-item-nav {
        background: var(--db-editor-color-select-light);
      }

      & > .layer-item-swapper {
        background: var(--db-editor-color-select-light);
        border-radius: var(--db-layer-item-radius);
      }
    }

    .layer-item-nav {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--db-layer-item-height);
      padding-right: 4px;
      padding-left: 4px;
      color: var(--theme-color-text-primary);
      border-radius: var(--db-layer-item-radius);
      transition: background-color 0.15s;

      &.is-hidden {
        .layer-item-left .layer-item-labe,
        .layer-item-left .name-icon { opacity: 0.4; }
      }

      &.is-locked {
        .layer-item-left .layer-item-labe { color: var(--theme-color-tran-50); }
      }

      &.is-dragging { opacity: 0.3; }

      &.drop-before::before, &.drop-before::after, &.drop-after::before, &.drop-after::after {
        pointer-events: none;
      }

      &.drop-before::before {
        content: ''; position: absolute; top: -1px; left: 20px; right: 4px; height: 3px;
        background: var(--db-editor-color-primary); z-index: 100; box-shadow: 0 0 4px var(--db-editor-color-primary-glow);
      }
      &.drop-before::after {
        content: ''; position: absolute; top: -5px; left: 10px; width: 10px; height: 10px;
        border: 2px solid var(--db-editor-color-primary); border-radius: 50%; background: var(--db-editor-color-panel-bg); z-index: 101;
      }

      &.drop-after::before {
        content: ''; position: absolute; bottom: -1px; left: 20px; right: 4px; height: 3px;
        background: var(--db-editor-color-primary); z-index: 100; box-shadow: 0 0 4px var(--db-editor-color-primary-glow);
      }
      &.drop-after::after {
        content: ''; position: absolute; bottom: -5px; left: 10px; width: 10px; height: 10px;
        border: 2px solid var(--db-editor-color-primary); border-radius: 50%; background: var(--db-editor-color-panel-bg); z-index: 101;
      }

      &.drop-inside {
        outline: 2px solid var(--db-editor-color-primary); outline-offset: -2px;
        background: var(--db-editor-color-primary-light) !important; z-index: 50;
      }

      .layer-item-left {
        position: relative; display: flex; align-items: center;
        .arrow {
          position: absolute; left: -20px; cursor: pointer; transition: transform 0.2s; transform: rotate(-90deg); opacity: 0.5;
          &.active { transform: rotate(0deg); }
        }
        .dot {
          position: absolute; left: -12px; width: 6px; height: 6px; background: var(--theme-color-tran-12); border-radius: 2px;
        }
        .name-icon { color: var(--theme-color-tran-50); }
        .name-icon-margin { margin: 0 2px; }
        .layer-item-labe { font-size: 12px; }
      }

      .layer-item-handle {
        display: flex; align-items: center; gap: 2px;
        .lock-btn, .hide-btn {
          width: var(--db-layer-icon-size) !important; height: var(--db-layer-icon-size) !important;
          color: var(--theme-color-tran-20); opacity: var(--db-layer-icon-opacity);
          &:hover { color: var(--theme-color-text-primary); opacity: 1; }
          &.is-active {
            width: var(--db-layer-icon-size-active) !important; height: var(--db-layer-icon-size-active) !important;
            color: var(--theme-color-tran-50); opacity: var(--db-layer-icon-opacity-active);
          }
        }
        .inherited-dot {
          width: var(--db-layer-dot-size); height: var(--db-layer-dot-size); background: var(--theme-color-tran-15); border-radius: 50%;
        }
      }

      &:hover {
        background: var(--theme-color-tran-4);
        .layer-item-left .name-icon { color: var(--theme-color-text-primary); }
      }

      &.active {
        background-color: var(--db-editor-color-select);

        .layer-item-left {
          .layer-item-labe {
            color: var(--db-layer-text-active);
          }
          .name-icon {
            color: var(--db-layer-text-active);
          }
        }

        .layer-item-handle {
          .lock-btn,
          .hide-btn {
            color: var(--db-layer-icon-color-active);
            opacity: var(--db-layer-icon-opacity-active);

            &.is-active {
              color: var(--db-layer-icon-color-active-checked);
            }

            &:hover {
              color: var(--db-layer-text-active);
              opacity: 1;
            }
          }

          .inherited-dot {
            background: var(--db-layer-dot-bg-active);
          }
        }
      }
    }
  }
}
</style>
