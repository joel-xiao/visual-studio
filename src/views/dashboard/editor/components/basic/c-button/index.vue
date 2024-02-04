<template lang="pug">
BasicBox(:type="type || 'button'" @click="onClick")
  BasicIcon(:icon="icon")
</template>

<script lang="ts"></script>

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

const onClick = function () {
  console.log('onClick');
};
</script>

<style lang="scss"></style>
