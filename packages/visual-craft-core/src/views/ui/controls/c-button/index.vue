<template>
<BasicBox class="c-button" v-bind="$attrs" :type="type || 'button'" v-hint="hint" @update="onUpdate">
  <BasicIcon v-if="resolvedIcon" :icon="resolvedIcon" :spin="resolvedIcon === 'mdi:loading'" />
  <div class="c-button-text" :class="buttonTextClass">
    <slot ></slot>
  </div>
</BasicBox>
</template>

<script lang="ts">
import { hintDirective } from '@/directives/hint';

export default {
  name: 'C_BUTTON',
  inheritAttrs: false,
  directives: {
    hint: hintDirective
  }
};
</script>

<script setup lang="ts">
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';
import { computed } from 'vue';
export interface Props {
  type?: string; // status-button button
  icon?: string;
  loading?: boolean;
  dataType?: BooleanConstructor;
  hint?: string;
}
const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  icon: '',
  loading: false,
  dataType: Boolean,
  hint: ''
});

const resolvedIcon = computed(() => {
  return props.loading ? 'mdi:loading' : props.icon;
});

const buttonTextClass = computed(() => ({
  'no-padding': !!resolvedIcon.value
}));

const emit = defineEmits(['update']);
const onUpdate = function (value: boolean) {
  emit('update', value);
};
</script>

<style lang="scss">
#visual-craft-core .c-button {
  .c-button-text {
    padding: 0px 10px;

    &.no-padding {
      padding: 0px;
    }
  }

  &[primary] {
    background: var(--db-color-button-primary-bg);
    color: var(--theme-color-text-primary-white);

    &:hover {
      background: var(--db-color-button-primary-bg-hover);
    }
  }

  &[cancel] {
    background: var(--db-color-button-cancel-bg);
    color: var(--db-color-button-text);

    &:hover {
      background: var(--db-color-button-cancel-bg-hover);
    }
  }
}
</style>
