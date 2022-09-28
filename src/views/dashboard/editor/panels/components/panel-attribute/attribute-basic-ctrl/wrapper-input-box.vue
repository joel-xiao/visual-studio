<template lang="pug">
div(class="attribute-basic-wrapper-input-box input-focus transition")
  slot
</template>

<script setup lang="ts"></script>

<style lang="scss">
.attribute-basic-wrapper-input-box {
  border-radius: 6px;
  height: 30px;
  position: relative;
  background: var(--color-input-background);

  &.input-focus {
    box-shadow: 0 0 0 2px var(--color-focus-border) inset;
  }
}
</style>
