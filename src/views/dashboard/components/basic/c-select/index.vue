<template>
  <div class="c-select">
    <BasicBox ref="boxRef" type="select">
      <BasicIcon :lock="lock" :icon="icon" />
      <BasicInput :disabled="lock" v-bind="$attrs" @update="onUpdate" type="text" />
      <div class="c-select-icon" @click="onOpenWrapper">
        <i class='icon-font icon-shouqi2'></i>
      </div>
    </BasicBox>
    <div ref="selectMaskRef" class="c-select-mask" @click="onClose"></div>
    <div ref="selectWrapperRef" class="c-select-wrapper">
      <div class="c-select-item" :class="enterItem === item ? 'active' : ''" v-for="item of items"
        @mouseenter="onItemEnter(item)" @click="onItemClick(item)">
        <div class="c-select-item-icon">
          <i v-if="currItem === item" class='icon-font icon-shouqi2'></i>
        </div>
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
  name: 'C_SELECT',
};
</script>

<script setup lang="ts">
import { ref, reactive, provide, withDefaults } from 'vue';
import BasicBox from '../components/basic-box.vue';
import BasicIcon from '../components/basic-icon.vue';
import BasicInput from '../components/basic-input.vue';

interface IProps {
  lock?: boolean;
  icon?: string;
}
const props = withDefaults(defineProps<IProps>(), {
  lock: false,
  icon: '',
});

const emit = defineEmits(['update']);

const items = ref<string[]>(['1w23', '123', '12wa3', '12we3']);
const currItem = ref('1w23');
const enterItem = ref(currItem.value);

const onUpdate = function (value: string | number) {
  emit('update', value);
};

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);
const selectMaskRef = ref<null | HTMLElement>(null);
const selectWrapperRef = ref<null | HTMLElement>(null);

function onOpenWrapper() {
  if (selectMaskRef.value && selectWrapperRef.value && boxRef.value) {
    const boxRect = boxRef.value.getRect();
    selectMaskRef.value.style.display = 'block';
    selectWrapperRef.value.style.display = 'block';
    selectWrapperRef.value.style.width = boxRect.width + 'px';
    selectWrapperRef.value.style.top = boxRect.top + 'px';
    selectWrapperRef.value.style.left = boxRect.left + 'px';
  }
}

function onClose() {
  if (selectMaskRef.value && selectWrapperRef.value) {
    selectMaskRef.value.style.display = 'none';
    selectWrapperRef.value.style.display = 'none';
  }
}

function onItemEnter(item: string) {
  enterItem.value = item;
}

function onItemClick(item: string) {
  currItem.value = item;
  enterItem.value = item;
  onClose();
}
</script>

<style lang="scss">
#dashboard .c-select {
  width: 100%;

  .c-select-icon {
    margin-right: 2px;
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
  }

  &:hover {
    .c-select-icon {
      background-color: var(--db-color-select-arrow-bg-hover);
    }
  }

  .c-select-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: none;
    z-index: 1;
  }

  .c-select-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    padding: 6px 0px;
    background-color: var(--db-color-select-wrapper-background);
    border: 1px solid var(--theme-color-gray-100);
    border-radius: 6px;
    display: none;
    z-index: 1;

    .c-select-item {
      margin: 0 6px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0px 4px;
      font-weight: normal;

      &:hover,
      &.active {
        background-color: var(--db-color-select-item-bg-hover);
      }

      .c-select-item-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
      }

      span {
        color: var(--db-color-select-item-text);
        font-size: 12px;
      }
    }
  }
}
</style>
