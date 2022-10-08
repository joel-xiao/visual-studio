<template lang="pug">
input(class="attribute-basic-input" v-bind="$attrs" v-on="$listeners")
</template>

<script setup lang="ts"></script>

<style lang="scss">
.editor-panel-attribute .attribute-basic-input {
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
</style>
