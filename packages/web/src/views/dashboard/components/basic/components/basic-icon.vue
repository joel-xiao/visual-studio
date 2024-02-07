<script setup lang="ts">
import { computed } from 'vue';

interface IProps {
  lock?: boolean;
  icon?: string;
}
const props = withDefaults(defineProps<IProps>(), {
  lock: false,
  icon: ''
});

const iconClass = computed(() => ({
  lock: !!props.lock
}));

const isIcon = computed(() => {
  return !props.icon?.includes('.');
});

const isIconText = computed(() => {
  return isIcon.value && !props.icon?.startsWith('icon');
});
</script>

<template lang="pug">
div(class="basic-icon" :class="iconClass")
  span(class='icon-text' v-if="isIconText")
   | {{ icon }}
  i(class='icon-font' :class='icon' v-else-if="isIcon")
</template>

<style lang="scss">
#dashboard .basic-icon {
  line-height: 1;
  width: 30px;
  height: 100%;
  display: flex;
  box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--db-editor-icon-color);
  user-select: none;

  &.lock {
    opacity: 0.5;
  }

  .icon-text {
    font-size: 12px;
    font-weight: normal;
    transform: scale(0.9);
  }
}
</style>
