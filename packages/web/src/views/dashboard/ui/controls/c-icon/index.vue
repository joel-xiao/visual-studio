<template>
  <BasicBox class="c-icon" v-bind="$attrs" :type="type">
    <BasicIcon :icon="icon" :lock="lock" :hover="hover" :size="size" />
  </BasicBox>
</template>

<script lang="ts">
export default {
  name: 'C_ICON',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';

interface Props {
  icon?: string;
  type?: string;
  lock?: boolean;
  hover?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  type: '', // e.g. 'hover', 'button' for box styles
  lock: false,
  hover: false,
  size: 'medium'
});
</script>

<style lang="scss">
#dashboard .c-icon {
  justify-content: center;
  
  // Inherits box interactions from BasicBox based on type
}
</style>
