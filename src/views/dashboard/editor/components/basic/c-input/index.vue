<template lang="pug">
BasicBox(ref='box' type="input")
  BasicIcon(:lock="lock")
  BasicInput(:disabled="lock" v-bind="$attrs" @focus="onFocus" @blur="onBlur" @keydown="onKeyDown" @keyup="onKeyUp" @input="onInput" type="text" placeholder="")
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>
<script setup lang="ts">
import { ref, reactive, provide, withDefaults } from 'vue';
import BasicBox from '../components/basic-box.vue';
import BasicIcon from '../components/basic-icon.vue';
import BasicInput from '../components/basic-input.vue';

interface Props {
  lock?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  lock: false
});

const box = ref<null | InstanceType<typeof BasicBox>>(null);

const onFocus = function () {
  box.value?.focus();
};

const onBlur = function () {
  box.value?.blur();
};

const onKeyDown = function () {
  console.log('keydown');
};

const onKeyUp = function () {
  console.log('keyup');
};

const onInput = function () {
  console.log('input');
};
</script>

<style lang="scss"></style>
