<script lang="ts" setup>
import { inject, withDefaults } from 'vue';
import type { ComponentData } from './interface';

interface Props {
  data?: ComponentData | { name?: string };
  darg: boolean | undefined | null;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  darg: false
});

const emit = defineEmits(['arrow', 'drag-start', 'drag-stop']);

const onArrow = function (item: ComponentData) {
  emit('arrow', item);
};

const onDragStart = function (event: DragEvent, item: ComponentData): void {
  emit('drag-start', event, item);
};
const onDragStop = function (event: DragEvent): void {
  emit('drag-stop', event);
};
const onDrag = function (event: DragEvent): void {
  event.preventDefault();
};

const getType = inject('getType');
</script>
<template lang="pug">
div.component-box__container(v-for="(item, idx) in data.children" v-show="data.component || data.AFold" v-if="Array.isArray(data.children) && data.children.length > 0" :key="(item.id || '') + idx")
  template(v-if="data.component")
    div.component-box__swapper(:class="typeof getType === 'function' ? getType() : ''")
      div.component-item__content(
        :draggable="darg ? true : false"
        @dragstart="onDragStart($event, item)"
        @dragend="onDragStop"
        @dragover="onDrag"
        @dragenter="onDrag"
        )
        img(:src="item.icon")
      div.component-item__label {{ item.name }}

  template(v-else-if="!item.dot")
    div(class="component-box__title transition" @click="onArrow(item)")
      Icon(src="icon-zhankai" class="arrow" :class="{ 'active': item.AFold }")
      div.component-box__title__text {{ item.name }}
  template(v-else)
    div(class="component-box__title dot")
      div.component-box__title__text {{ item.name }}

  template(v-if="!item.component")
    ComponentItem(:data="item" :darg="darg" @drag-start="onDragStart"  @drag-stop="onDragStop" v-if="Array.isArray(item.children) && item.children.length > 0")
  template(v-else)
    div.component-box__list
      ComponentItem(:data="item" :darg="darg" @drag-start="onDragStart"  @drag-stop="onDragStop" v-if="Array.isArray(item.children) && item.children.length > 0")
</template>

<style lang="scss">
.editor-panel-component {
  .component-box__container {
    flex: none;
    .component-box__title {
      padding: 0 6px;
      font-size: 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      height: 30px;
      &:hover {
        background: var(--color-tran-6);
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
          background-color: var(--color-tran-30);
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
        background-color: rgb(255, 255, 255);
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 100%;
          height: 100%;
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
