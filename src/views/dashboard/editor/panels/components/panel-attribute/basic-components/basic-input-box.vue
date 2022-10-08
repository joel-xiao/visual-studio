<template lang="pug">
div(class="attribute-basic-input-box transition" :key="keyValue" :class="{'input-focus': data.isFocus}")
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
  isFocus: false
});

const focus = function () {
  data.isFocus = true;
};

const blur = function () {
  data.isFocus = false;
};

defineExpose({ focus, blur });
</script>

<style lang="scss">
.editor-panel-attribute .attribute-basic-input-box {
  border-radius: 6px;
  height: 30px;
  position: relative;
  background: var(--color-input-background);
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;

  &.input-focus {
    box-shadow: 0 0 0 2px var(--color-focus-border) inset;
  }
}
</style>
