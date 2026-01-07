<template>
  <BasicBox class="c-icon" v-bind="$attrs" :type="type" v-hint="hint">
    <BasicIcon :icon="icon" :lock="lock" :hover="hover" :size="size" :spin="spin" />
  </BasicBox>
</template>

<script lang="ts">
import { hintDirective } from '@/directives/hint';

export default {
  name: 'C_ICON',
  inheritAttrs: false,
  directives: {
    hint: hintDirective
  }
};
</script>

<script setup lang="ts">
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';

export interface Props {
  icon?: string;
  type?: string;
  lock?: boolean;
  hover?: boolean;
  size?: 'small' | 'medium' | 'large';
  spin?: boolean;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  type: '', // e.g. 'hover', 'button' for box styles
  lock: false,
  hover: false,
  size: 'medium',
  spin: false,
  hint: ''
});
</script>

<style lang="scss">
#visual-craft-core .c-icon {
  justify-content: center;

  // Inherits box interactions from BasicBox based on type
}
</style>
