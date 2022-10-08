<template lang="pug">
div(class="attribute-basic-icon" :class="iconClass")
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  lock?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  lock: false
});

const iconClass = computed(() => ({
  lock: !!props.lock
}));
</script>

<style lang="scss">
.editor-panel-attribute .attribute-basic-icon {
  line-height: 1;
  width: 30px;
  height: 100%;
  display: flex;
  box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--color-text-primary);

  &.lock {
    opacity: 0.5;
  }
}
</style>
