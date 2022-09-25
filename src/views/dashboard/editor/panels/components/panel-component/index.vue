<template lang="pug">
div(class='editor-panel-component')
  div.component-header
    div.search
      NInput(placeholder="搜索关键词..." size="small")
        template(#prefix)
          Icon(src='icon-sousuo')
    Icon(button @click="onSwitchType" size="small" :src="currentType.icon" class="icon-btn")

  div.component-masters
    div.master-collapse( v-for="(item, idx) in data" :key="(item.id || '') + idx")
      div(class="master-collapse__title" @click="onArrow(item)")
        div.master-collapse__title__text {{ item.name }}
        Icon(src="icon-shouqi2" class="arrow" :class="{ 'active': item.AFold }")
      ComponentItem(:data="item" :darg="!!darg" @arrow="onArrow" @drag-start="onDragStart" @drag-stop="onDragStop")



</template>

<script setup lang="ts">
import { ref, reactive, provide, withDefaults } from 'vue';
import type { ComponentData } from './interface';
import ComponentItem from './component-item.vue';

interface Props {
  data?: ComponentData[];
  darg?: boolean | undefined | null;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  darg: true
});

const emit = defineEmits(['drag-start', 'drag-stop']);

const onArrow = function (item: ComponentData): void {
  item.AFold = !item.AFold;
};

const onDragStart = function (event: DragEvent, item: ComponentData): void {
  emit('drag-start', item, event);
};
const onDragStop = function (event: DragEvent): void {
  emit('drag-stop', event);
};

let currentType = ref<{ icon?: string; id?: string }>({});
const getCurrentType = function (): string {
  return currentType.value.id || '';
};

const onSwitchType = function (): void {
  currentType.value =
    currentType.value.id === 'icon'
      ? { icon: 'icon', id: 'list' }
      : { icon: 'icon-sousuo', id: 'icon' };
};
onSwitchType();

provide('getType', getCurrentType);
</script>

<style lang="scss">
.editor-panel-component {
  padding: 0 6px 6px;
  position: relative;
  .component-header {
    padding: 6px 0 12px 6px;
    display: flex;
    align-items: center;
    .search {
      width: 100%;
      padding-right: 6px;
      height: 30px;

      .n-input {
        height: 100%;
        border-radius: var(--border-radius-6);
      }
    }
    .icon-btn {
      flex: none;
    }
  }

  .component-masters {
    .master-collapse {
      .master-collapse__title {
        padding: 0 6px;
        font-size: 12px;
        font-weight: 600;
        height: 30px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:hover {
          background: var(--color-tran-6);
        }

        .master-collapse__title__text {
          margin-right: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .arrow {
          font-weight: none;
          opacity: 0.6;
          transform: scale(0.9);
          transition: transform 0.1s;
          &.active {
            transform: scale(0.9) rotate(90deg);
          }
        }
      }
    }
  }
}
</style>
