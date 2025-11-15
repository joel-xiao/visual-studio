<script lang="ts" setup>
import { computed, reactive, withDefaults } from 'vue';

interface Props {
  src?: string;
  button?: boolean;
  block?: boolean;
  size?: CSize;
  fontSize?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  button: false,
  block: false,
  size: '',
  fontSize: ''
});

const Style = reactive({
  fontSize: props.fontSize
});

const isIcon = computed(() => {
  return !props.src?.includes('.');
});
</script>

<template lang="pug">
span(class='c-icon-font' v-bind="$attrs" :style="Style" :class="[button ? 'button' : '', block ? 'block' : '', size, !isIcon ? 'img' : '']")
  i(class='icon-font' :class='src' v-if="isIcon")
  img(class='icon-img' v-else :src="src")
</template>

<style lang="scss">
.c-icon-font {
  display: inline-block;
  overflow: hidden;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;

  .icon-font {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .icon-img {
    max-width: 100%;
    width: calc(100% - 2px);
    max-height: 100%;
  }

  &.block {
    width: 20px;
    height: 20px;
    margin: 2px;
  }

  &.img {
    margin: 0px 8px;
  }

  &.button {
    width: 20px;
    height: 20px;
    margin: 2px;
    color: var(--theme-color-tran-85);
    transition: all 0.15s;

    &:hover {
      background-color: var(--theme-color-tran-6);
    }

    &.active {
      color: var(--theme-color-tran-85);
      background: var(--theme-color-tran-12);
    }

    &[circle] {
      border-radius: 50%;
    }
  }

  &.small {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  &.medium {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}
</style>
