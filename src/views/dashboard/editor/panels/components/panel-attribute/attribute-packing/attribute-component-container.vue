<template lang="pug">
AttributeContainerLayout(keyValue="component-container")
  AttributePropsItem
    AttributeInput(v-model="modelValue.x")
    AttributeInput(v-model="modelValue.y")
  AttributePropsItem
    AttributeInput(v-model="modelValue.w")
    AttributeInput(v-model="modelValue.h")
    AttributeStatusButton(v-model="data.isLockScale")
  AttributePropsItem
    AttributeInput(v-model="modelValue.rotate")
    div(class="attribute-container-rotate")
      AttributeButton(@click="onRotate('x')")
      AttributeButton(@click="onRotate('y')")
  AttributePropsItem(type="radius")
    AttributeRadius(v-model="modelValue.radius")
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import AttributeContainerLayout from './../attribute-components/attribute-container-layout.vue';
import AttributePropsItem from './../attribute-components/attribute-props-item.vue';
import AttributeInput from './../attribute-components/attribute-input.vue';
import AttributeButton from './../attribute-components/attribute-button.vue';
import AttributeStatusButton from './../attribute-components/attribute-status-button.vue';
import AttributeRadius from './../attribute-components/attribute-radius.vue';

interface Props {
  lock?: boolean;
  modelValue: {
    x: number;
    y: number;
    w: number;
    h: number;
    rotate: number;
    radius: number[];
  };
}
const props = withDefaults(defineProps<Props>(), {
  lock: false,
  modelValue: () => ({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    rotate: 0,
    radius: [0, 0, 0, 0]
  })
});

const emit = defineEmits(['update:modelValue']);

const data = reactive({
  isLockScale: false
});

const onRotate = function (type: string) {
  let modelValue = reactive(props.modelValue);
  if (type === 'x') modelValue.rotate = 180 - modelValue.rotate;
  if (type === 'y') modelValue.rotate = -modelValue.rotate;
};
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
