<template lang="pug">
BasicBox(class="c-button" v-bind="$attrs" :type="type || 'button'" @update="onUpdate")
  BasicIcon(:icon="icon" v-if="icon")
  div( class="c-button-text" :class="buttonTextClass")
    <slot/>
</template>

<script lang="ts">
export default {
  name: 'C_BUTTON',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';
import { reactive } from 'vue';
interface Props {
  type?: string; // status-button button
  icon?: string;
  dataType?: BooleanConstructor;
}
const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  icon: '',
  dataType: Boolean
});

const buttonTextClass = reactive({
  'no-padding': !!props.icon
});

const emit = defineEmits(['update']);
const onUpdate = function (value: boolean) {
  emit('update', value);
};
</script>

<style lang="scss">
#dashboard .c-button {
  .c-button-text {
    padding: 0px 10px;

    &.no-padding {
      padding: 0px;
    }
  }
}
</style>
