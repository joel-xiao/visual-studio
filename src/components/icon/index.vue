<script lang="ts" setup>
import { withDefaults } from 'vue';

interface Props {
  src?: string;
  button?: boolean;
  block?: boolean;
  size?: string;
}

withDefaults(defineProps<Props>(), {
  src: '',
  button: false,
  block: false,
  size: ''
});
</script>

<template lang="pug">
span(class='c-icon-font' :class="[button ? 'button' : '', block ? 'block' : '', size]")
  i(class='icon-font' :class='src')
</template>

<style lang="scss">
.c-icon-font {
  display: inline-block;
  overflow: hidden;
  border-radius: 4px;
  overflow: hidden;

  .icon-font {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &.block {
    width: 20px;
    height: 20px;
    margin: 2px;
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
  }

  &.small {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
}
</style>
