<template lang="pug">
div(class="basic-select" :class="{ 'has-label': showLabel, disabled: disabled }" @click="onTriggerClick")
  div(v-if="showLabel" class="basic-select-label" :style="{ textAlign: labelAlign }") {{ currLabel }}
  div(class="basic-select-arrow")
    i(class="icon-font icon-shouqi2")
  div(ref="selectMaskRef" class="basic-select-mask" @click.stop="onClose")
  div(ref="selectWrapperRef" class="basic-select-wrapper" @click.stop)
    template(v-for="(item, idx) of options" :key="idx")
      div(
        class="basic-select-item"
        :class="enterValue === item.value ? 'active' : ''"
        @mouseenter="onItemEnter(item)"
        @click.stop="onItemClick(item)"
      )
        div(class="basic-select-item-icon")
          i(v-if="modelValue === item.value" class="icon-font icon-shouqi2")
        span {{ item.label }}
      div(v-if="item.splitLine" class="basic-select-item-split-line")
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';

interface Item {
  label: string;
  value: string | number;
  splitLine?: boolean;
}

interface Props {
  modelValue?: string | number;
  options?: Item[];
  showLabel?: boolean;
  labelAlign?: 'left' | 'center' | 'right';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  showLabel: true,
  labelAlign: 'left',
  disabled: false
});

const emit = defineEmits(['update:modelValue', 'update', 'close', 'click']);

const selectMaskRef = ref<null | HTMLElement>(null);
const selectWrapperRef = ref<null | HTMLElement>(null);
const enterValue = ref<string | number>('');

const currLabel = computed(() => {
  const item = props.options?.find(item => item.value === props.modelValue);
  return item ? item.label : props.modelValue;
});

function onTriggerClick(event: MouseEvent) {
  if (props.disabled) return;
  emit('click', event);
}

function onClose() {
  if (selectMaskRef.value && selectWrapperRef.value) {
    selectMaskRef.value.style.display = 'none';
    selectWrapperRef.value.style.display = 'none';
    emit('close');
  }
}

function open(triggerEl: HTMLElement) {
  if (selectMaskRef.value && selectWrapperRef.value && triggerEl) {
    enterValue.value = props.modelValue;
    const triggerRect = triggerEl.getBoundingClientRect();
    selectMaskRef.value.style.display = 'block';
    selectWrapperRef.value.style.display = 'block';
    selectWrapperRef.value.style.visibility = 'hidden';
    selectWrapperRef.value.style.width = triggerRect.width + 'px';

    // Initial positioning
    selectWrapperRef.value.style.top = triggerRect.top + 'px';
    selectWrapperRef.value.style.left = triggerRect.left + 'px';

    nextTick(() => {
      if (selectWrapperRef.value) {
        const activeItem = selectWrapperRef.value.querySelector('.active') as HTMLElement;
        let targetTop = triggerRect.top;
        let targetScrollTop = 0;

        if (activeItem) {
          targetTop = triggerRect.top - activeItem.offsetTop;
        }

        // Adjust for top boundary
        if (targetTop < 10) {
          const diff = 10 - targetTop;
          targetTop = 10;
          targetScrollTop += diff;
        }

        // Adjust for bottom boundary
        const wrapperHeight = selectWrapperRef.value.offsetHeight;
        const windowHeight = window.innerHeight;

        if (targetTop + wrapperHeight > windowHeight - 10) {
          const diff = targetTop + wrapperHeight - (windowHeight - 10);
          targetTop -= diff;
          targetScrollTop -= diff;
        }

        // Clamp scrollTop
        const maxScroll = selectWrapperRef.value.scrollHeight - selectWrapperRef.value.offsetHeight;
        if (targetScrollTop < 0) targetScrollTop = 0;
        if (targetScrollTop > maxScroll) targetScrollTop = maxScroll;

        selectWrapperRef.value.style.top = targetTop + 'px';
        selectWrapperRef.value.scrollTop = targetScrollTop;
        selectWrapperRef.value.style.visibility = 'visible';
      }
    });
  }
}

function onItemEnter(item: Item) {
  enterValue.value = item.value;
}

function onItemClick(item: Item) {
  emit('update:modelValue', item.value);
  emit('update', item.value);
  onClose();
}

defineExpose({ open, close });
</script>

<style lang="scss">
#dashboard {
  .basic-select {
    display: flex;
    align-items: center;
    min-width: 0;
    cursor: pointer;
    justify-content: space-between;

    &.has-label {
      flex: 1;
      color: var(--db-color-input);
    }

    &.disabled {
      cursor: not-allowed;
      user-select: none;

      .basic-select-label,
      .basic-select-arrow {
        color: var(--db-color-input-disabled-background);
      }

      .basic-select-arrow {
        &:hover {
          background-color: transparent;
        }
      }
    }

    .basic-select-label {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 4px;
    }
  }

  .basic-select-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: none;
    z-index: 9999;
  }

  .basic-select-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    padding: 6px 0px;
    background-color: var(--db-color-select-wrapper-background);
    border: 1px solid var(--theme-color-gray-100);
    border-radius: 6px;
    display: none;
    z-index: 10000;
    max-height: 260px;
    overflow-y: auto;

    .basic-select-item {
      margin: 0 6px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0px 4px;
      font-weight: normal;
      cursor: pointer;

      &:hover,
      &.active {
        background-color: var(--db-color-select-item-bg-hover);
      }

      .basic-select-item-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon-shouqi2 {
            transform: rotate(90deg);
            font-size: 12px;
        }
      }

      span {
        color: var(--db-color-select-item-text);
        font-size: 12px;
      }
    }

    .basic-select-item-split-line {
      height: 1px;
      background-color: var(--theme-color-gray-100);
      margin: 6px 6px;
    }
  }

  .basic-select-arrow {
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: none;
    color: var(--db-color-select-arrow);
    user-select: none;
    position: relative;
    transform: scale(0.9) rotate(90deg);
    font-weight: normal;

    width: 26.6px;
    height: 26.6px;
    border-radius: 3px;

    &:hover {
      background-color: var(--db-color-select-arrow-bg-hover);
    }
  }
}
</style>
