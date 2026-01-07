<script lang="ts">
import { hintDirective } from '@/directives/hint';

export default {
  directives: {
    hint: hintDirective
  }
};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

interface IProps {
  lock?: boolean;
  icon?: string;
  hover?: boolean;
  size?: 'small' | 'medium' | 'large';
  spin?: boolean;
  hint?: string;
}
const props = withDefaults(defineProps<IProps>(), {
  lock: false,
  icon: '',
  hover: false,
  size: 'medium',
  spin: false,
  hint: ''
});

const iconClass = computed(() => ({
  lock: !!props.lock,
  hover: !!props.hover,
  spinning: props.spin || props.icon === 'mdi:loading',
  [props.size]: true
}));

const hintContent = computed(() => (props.hint || '').trim());

const isIconify = computed(() => {
  return props.icon?.includes(':');
});

const isIcon = computed(() => {
  return !props.icon?.includes('.');
});

const isIconText = computed(() => {
  return isIcon.value && !props.icon?.startsWith('icon') && !isIconify.value;
});
</script>

<template>
<div class="basic-icon" :class="iconClass" v-hint="hintContent">
  <Icon v-if="isIconify" :icon="icon" />
  <span v-else-if="isIconText" class="basic-icon-text">{{ icon }}</span>
  <i v-else-if="isIcon" class="icon-font" :class="icon"></i>
</div>
</template>

<style lang="scss">
#visual-craft-core .basic-icon {
  line-height: 1;
  display: flex;
  flex: none;
  justify-content: center;
  align-items: center;
  color: var(--db-editor-icon-color);
  user-select: none;
  position: relative;
  font-weight: normal;

  &.small {
    width: 20px;
    font-size: 14px;
    .iconfont { font-size: 14px; }
  }

  &.medium {
    width: 24px;
    font-size: 16px;
    .iconfont { font-size: 16px; }
  }

  &.large {
    width: 32px;
    font-size: 20px;
    .iconfont { font-size: 20px; }
  }

  &.lock {
    opacity: 0.5;
  }

  &.hover {
    border-radius: 3px;
    cursor: pointer;
    &.small { width: 24px; height: 24px; }
    &.medium { width: 28px; height: 28px; }
    &.large { width: 36px; height: 36px; }

    &:hover {
      background-color: var(--db-color-select-arrow-bg-hover);
    }
  }

  .basic-icon-text {
    font-size: 0.8em; // Relative to parent font size
    font-weight: normal;
  }

  &.spinning {
    svg,
    i {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
