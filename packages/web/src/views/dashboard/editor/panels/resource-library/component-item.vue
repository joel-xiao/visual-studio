<script lang="ts" setup>
import { computed, inject, withDefaults } from 'vue';

interface Props {
  data?: PanelComponentData | { name?: string; children?: PanelComponentData[] };
  drag: boolean | undefined | null;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  drag: false
});

const emit = defineEmits(['arrow', 'drag-start', 'drag-stop']);

const Items = computed(() => {
  const children = props.data.children || [];
  return children.filter((item: PanelComponentData) => item.show !== false);
});

const onArrow = function (item: PanelComponentData) {
  emit('arrow', item);
};

const onDragStart = function (event: DragEvent, item: PanelComponentData): void {
  emit('drag-start', event, item);
};
const onDragStop = function (event: DragEvent): void {
  emit('drag-stop', event);
};
const onDrag = function (event: DragEvent): void {
  event.preventDefault();
};

const getType = inject('getType');

const currentData = computed(() => props.data as PanelComponentData);
</script>
<template>
  <template v-if="Array.isArray(data.children) && data.children.length > 0">
    <div v-for="(item, idx) in Items" v-show="currentData.component || currentData.AFold" :key="(item.id || '') + idx" class="component-box__item-wrapper">
      <template v-if="currentData.component">
        <div class="component-box__swapper" :class="typeof getType === 'function' ? getType() : ''">
          <div
class="component-item__content"
            :draggable="drag ? true : false"
            @dragstart="onDragStart($event, item)"
            @dragend="onDragStop"
            @dragover="onDrag"
            @dragenter="onDrag"
          >
            <img :src="item.icon" />
          </div>
          <div class="component-item__label">{{ item.name }}</div>
        </div>
      </template>

      <template v-else-if="!item.dot">
        <div class="component-box__title transition" @click="onArrow(item)">
          <Icon src="icon-zhankai" class="arrow" :class="{ 'active': item.AFold }" />
          <div class="component-box__title__text">{{ item.name }}</div>
        </div>
      </template>
      <template v-else>
        <div class="component-box__title dot">
          <div class="component-box__title__text">{{ item.name }}</div>
        </div>
      </template>

      <template v-if="!item.component">
        <ComponentItem v-if="Array.isArray(item.children) && item.children.length > 0" :data="item" :drag="drag" @drag-start="onDragStart" @drag-stop="onDragStop" />
      </template>
      <template v-else>
        <div class="component-box__list">
          <ComponentItem v-if="Array.isArray(item.children) && item.children.length > 0" :data="item" :drag="drag" @drag-start="onDragStart" @drag-stop="onDragStop" />
        </div>
      </template>
    </div>
  </template>
</template>

<style lang="scss">
.editor-resource-library {
  .component-box__item-wrapper {
    flex: none;

    .component-box__title {
      padding: 0 6px;
      font-size: 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      height: 30px;

      &:hover {
        background: var(--theme-color-tran-6);
      }

      .component-box__title__text {
        margin-right: 9px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .arrow {
        transition: transform 0.1s;
        transform: rotate(-90deg);
        opacity: 0.5;
        margin-right: 6px;

        &.active {
          transform: rotate(0deg);
        }
      }

      &.dot {
        background: none;

        &::before {
          display: inline-block;
          content: ' ';
          width: 4px;
          height: 4px;
          border-radius: 2px;
          background-color: var(--theme-color-tran-30);
          margin: 3px 10px 3px 3px;
        }
      }
    }

    .component-box__list {
      padding: 0 6px;
      margin-top: 6px;
    }

    .component-box__swapper {
      .component-item__content {
        padding: 4px;
        background-color: hsla(0, 0%, 100%, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          max-width: 100%;
          max-height: 100%;
        }
      }

      &.icon {
        margin-bottom: 10px;

        .component-item__content {
          border-radius: 4px;
          max-width: 100%;
          max-height: 100%;
          min-width: 100%;
          min-height: 100%;
        }

        .component-item__label {
          display: none;
        }
      }

      &.list {
        margin-bottom: 12px;
        width: 100%;
        display: flex;
        height: 45px;
        width: 100%;
        border-radius: 3px;
        align-items: center;

        .component-item__content {
          border-radius: 3px;
          width: 45px;
          height: 45px;
          flex: none;
        }

        .component-item__label {
          width: 100%;
          margin: 0 9px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
