<template lang="pug">
WrapperInputBox
  div(class="attribute-basic-input-layout")
    div(class="attribute-basic-label-icon")
    input(class="attribute-basic-input" @focus="onFocus" @blur="onBlur" @keydown="onKeyDown" @keyup="onKeyUp" @input="onInput" type="text" placeholder="")
</template>

<script setup lang="ts">
import WrapperInputBox from './wrapper-input-box.vue';

const onFocus = function (event) {
  console.log('focus');
};

const onBlur = function (event) {
  console.log('blur');
};

const onKeyDown = function (event) {
  console.log('keydown');
};

const onKeyUp = function (event) {
  console.log('keyup');
};

const onInput = function (event) {
  console.log('input');
};
</script>

<style lang="scss">
.attribute-basic-input-layout {
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  position: relative;
  height: 100%;
  .attribute-basic-label-icon {
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
  }

  .attribute-basic-input {
    width: 100%;
    height: 100%;
    color: var(--color-text-primary);
    background: transparent;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    font-size: inherit;
    font-weight: 500;
  }
}
</style>
