<template lang="pug">
div(class='editor-resource-library')
  div.component-header
    div.search
      CInput(icon="icon-sousuo" v-model="keyword" input @update="onUpdateKeyword" :focus="false" placeholder="搜索组件...")
    Icon(button @click="onSwitchType" size="small" :src="currentType.icon" class="icon-btn")

  div.component-masters
    div.master-collapse( v-for="(item, idx) in Data" :key="(item.id || '') + idx")
      div(class="master-collapse__title" @click="onArrow(item)")
        div.master-collapse__title__text {{ item.name }}
        Icon(src="icon-shouqi2" class="arrow" :class="{ 'active': item.AFold }")
      ComponentItem(:data="item" :drag="!!drag" @arrow="onArrow" @drag-start="onDragStart" @drag-stop="onDragStop")



</template>

<script setup lang="ts">
import { ref, reactive, provide, withDefaults, computed } from 'vue';
import ComponentItem from './component-item.vue';
import CInput from '../../../ui/controls/c-input/index.vue';

interface Props {
  data?: PanelComponentData[];
  drag?: boolean | undefined | null;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  drag: true
});

const keyword = ref<string>('');
const onUpdateKeyword = function (value: string): void {
  keyword.value = value;
};

const Data = computed(() => {
  return showKeyword(props.data, keyword.value);
});

function showKeyword(data: PanelComponentData[], keyword: string): PanelComponentData[] {
  if (!keyword) {
    data.forEach(item => {
      item.show = undefined;
      if (Array.isArray(item.children)) {
        showKeyword(item.children, keyword);
      }
    });
  } else {
    data.forEach(item => {
      item.show = item.name.includes(keyword);
      if (Array.isArray(item.children)) {
        showKeyword(item.children, keyword);
        item.show = item.children.some(child => child.show) || item.show;
      }
    });
  }

  return data;
}

const emit = defineEmits(['drag-start', 'drag-stop']);

const onArrow = function (item: PanelComponentData): void {
  item.AFold = !item.AFold;
};

const onDragStart = function (event: DragEvent, item: PanelComponentData): void {
  emit('drag-start', item, event);
};
const onDragStop = function (event: DragEvent): void {
  emit('drag-stop', event);
};

const currentType = ref<{ icon?: string; id?: string }>({});
const getCurrentType = function (): string {
  return currentType.value.id || '';
};

const onSwitchType = function (): void {
  currentType.value =
    currentType.value.id === 'icon'
      ? { icon: 'icon-small-view', id: 'list' }
      : { icon: 'icon-list-view', id: 'icon' };
};
onSwitchType();

provide('getType', getCurrentType);
</script>

<style lang="scss">
.editor-resource-library {
  position: relative;
  box-sizing: border-box;
  height: 100%;

  .component-header {
    padding: 6px 6px 6px 12px;
    height: 48px;
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
    padding: 0px 6px;
    padding-bottom: 6px;
    box-sizing: border-box;
    overflow-y: auto;
    height: calc(100% - 48px);

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
          background: var(--theme-color-tran-6);
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
