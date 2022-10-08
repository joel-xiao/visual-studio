<template lang="pug">
AttributeContainerLayout(key="component-container")
  AttributePropsItem
    AttributeInput
    AttributeInput
  AttributePropsItem
    AttributeInput
    AttributeInput
    AttributeStatusButton(v-model="data.isLockScale")
  AttributePropsItem
    AttributeInput
    div(class="attribute-container-rotate")
      AttributeButton
      AttributeButton
  AttributePropsItem(type="radius")
    AttributeRadius
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import AttributeContainerLayout from './../attribute-components/attribute-container-layout.vue';
import AttributePropsItem from './../attribute-components/attribute-props-item.vue';
import AttributeInput from './../attribute-components/attribute-input.vue';
import AttributeButton from './../attribute-components/attribute-button.vue';
import AttributeStatusButton from './../attribute-components/attribute-status-button.vue';
import AttributeRadius from './../attribute-components/attribute-radius.vue';

const data = reactive({
  isLockScale: false
});
</script>

<style lang="scss">
.editor-panel-attribute .attribute-container-layout {
  .attribute-container-rotate {
    grid-template-columns: 1fr 1fr;
    display: grid;
    gap: 6px;
  }
}
</style>
