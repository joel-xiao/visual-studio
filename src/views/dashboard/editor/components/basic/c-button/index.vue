<template lang="pug">
BasicBox(v-bind="$attrs" :type="type || 'button'" @update="onUpdate")
  BasicIcon(:icon="icon")
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>
<script setup lang="ts">
import BasicBox from '../components/basic-box.vue';
import BasicIcon from '../components/basic-icon.vue';

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

const emit = defineEmits(['update']);
const onUpdate = function (value: boolean) {
  emit('update', value);
};
</script>

<style lang="scss"></style>
