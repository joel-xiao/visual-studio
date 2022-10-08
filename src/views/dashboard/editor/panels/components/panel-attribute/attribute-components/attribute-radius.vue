<template lang="pug">
div(class="attribute-radius")
  ul(class="attribute-radius__options")
    li
      AttributeInput
    template(v-if="data.isMore")
      li
        AttributeInput
      li
        AttributeInput
      li
        AttributeInput
  div(class="attribute-radius__button-switch")
    AttributeStatusButton(v-model="data.isMore")

</template>

<script setup lang="ts">
import { reactive } from 'vue';
import AttributeInput from './attribute-input.vue';
import AttributeStatusButton from './attribute-status-button.vue';

const data = reactive({
  isMore: false
});
</script>

<style lang="scss">
.editor-panel-attribute .attribute-radius {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr 30px;
  grid-gap: 6px;

  & > .attribute-radius__options {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-gap: 6px;
  }

  & > .attribute-radius__button-switch {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto;
    row-gap: 6px;
  }
}
</style>
