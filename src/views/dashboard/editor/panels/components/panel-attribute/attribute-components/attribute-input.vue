<template lang="pug">
BasicInputBox(ref='box' keyValue="attribute-input")
  BasicIcon(:lock="lock")
  BasicInput(:disabled="lock" v-bind="$attrs" @focus="onFocus" @blur="onBlur" @keydown="onKeyDown" @keyup="onKeyUp" @input="onInput" type="text" placeholder="")
</template>

<script setup lang="ts">
import { ref, reactive, provide, withDefaults } from 'vue';
import BasicInputBox from './../basic-components/basic-input-box.vue';
import BasicIcon from './../basic-components/basic-icon.vue';
import BasicInput from './../basic-components/basic-input.vue';

interface Props {
  lock?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  lock: false
});

const box = ref<null | InstanceType<typeof BasicInputBox>>(null);

const onFocus = function () {
  console.log('focus');
  box.value?.focus();
};

const onBlur = function () {
  console.log('blur');
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
