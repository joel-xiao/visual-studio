<template lang="pug">
BasicBox(v-bind="$attrs" :type="type || 'button'" @click="onClick")
  BasicIcon(:icon="icon")
</template>

<script lang="ts"></script>

<script setup lang="ts">
import BasicBox from '../components/basic-box.vue';
import BasicIcon from '../components/basic-icon.vue';

interface Props {
  type?: string; // status-button button
  icon?: string;
}
const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  icon: ''
});

const onClick = function () {
  console.log('onClick');
};
</script>

<style lang="scss"></style>
