<template lang="pug">
div(class="attribute-basic-button-box transition" :key="keyValue" :class="{'button-active': data.active}" @mousedown="focus" @mouseup="blur")
  slot
</template>

<script setup lang="ts">
import { reactive } from 'vue';

interface Props {
  keyValue: string;
}
const props = withDefaults(defineProps<Props>(), {
  keyValue: ''
});

const data = reactive({
  active: false
});

const focus = function () {
  data.active = true;
};

const blur = function () {
  data.active = false;
};
</script>

<style lang="scss">
.editor-panel-attribute .attribute-basic-button-box {
  border-radius: 6px;
  height: 30px;
  position: relative;
  background: var(--color-input-background);
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;

  &:hover {
    background: var(--color-button-secondary-bg-hover);
  }

  &.button-active {
    background: var(--color-button-secondary-bg-active);
  }
}
</style>
