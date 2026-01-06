<template>
  <div
    ref="propsLayout"
    :key="keyValue"
    class="schema-props-layout-pro"
    :class="{ 
      'is-inactive': hasSwitch && !switchValue,
      'is-collapsed': !isShown 
    }"
  >
    <!-- Header: Click to toggle manual expansion (if active) -->
    <div 
      v-if="showLabel" 
      class="layout-header" 
      :class="{ 'can-expand': hasSwitch && switchValue !== false }"
      @click="toggleExpand"
    >
      <div class="header-main">
        <!-- Blue bar: Only show when there is NO switch -->
        <div v-if="!hasSwitch" class="status-indicator"></div>
        
        <!-- Expander: Only show when there IS a switch -->
        <BasicExpander 
          v-if="hasSwitch"
          :model-value="isShown" 
          :disabled="hasSwitch && !switchValue"
          class="layout-trigger"
        />

        <span class="label-text">{{ label }}</span>
      </div>
      <div class="header-actions" @click.stop>
        <slot name="title"></slot>
        <BasicSwitch
          v-if="hasSwitch"
          :model-value="switchValue"
          @update:model-value="onSwitchChange"
        />
      </div>
    </div>
    
    <!-- Body: Visual expansion with smooth CSS transitions -->
    <transition name="expand">
      <div v-if="isShown" class="layout-body">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
export default {
  component_name: 'PANEL_PROPS_LAYOUT'
};
</script>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import BasicSwitch from '../../ui/base/basic-switch.vue';
import BasicExpander from '../../ui/base/basic-expander.vue';

export interface Props {
  keyValue: string;
  label?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  defaultExpand?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  keyValue: 'props-layout',
  label: '',
  hasSwitch: false,
  switchValue: true,
  defaultExpand: true
});

const emit = defineEmits(['update:switchValue', 'switch-change']);

const isExpanded = ref(props.defaultExpand);
const showLabel = computed(() => !!props.label);
const propsLayout = ref<HTMLElement>();

// Logical visibility controlled by both manual toggle and switch state
const isShown = computed(() => {
  if (props.hasSwitch && !props.switchValue) return false;
  return isExpanded.value;
});

const toggleExpand = () => {
  if (!props.hasSwitch) return; // Disable toggle if no switch
  if (props.switchValue === false) return; // Disable toggle if switch is OFF
  isExpanded.value = !isExpanded.value;
};

const onSwitchChange = (val: boolean) => {
  emit('update:switchValue', val);
  emit('switch-change', val);
  if (val) isExpanded.value = true;
};

onMounted(() => {
  propsLayout.value?.setAttribute(props.keyValue, '');
});
</script>

<style lang="scss">
.editor-schema-renderer .schema-props-layout-pro {
  --accent-color: var(--theme-color-blue-700);
  
  margin: 12px 0;
  background: transparent;
  transition: all 0.3s ease;

  .layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 10px 4px;
    border-bottom: 1px solid var(--theme-color-gray-100);
    margin-bottom: 14px;
    cursor: default;
    user-select: none;

    &.can-expand {
      cursor: pointer;
    }

    .header-main {
      display: flex;
      align-items: center;
      gap: 8px;

      .status-indicator {
        width: 3px;
        height: 14px;
        background-color: var(--accent-color);
        border-radius: 2px;
        transition: all 0.3s ease;
      }

      .layout-trigger {
        margin-left: -5px;
        margin-right: -4px;
        transform: scale(0.9);
      }

      .label-text {
        font-size: 12px;
        font-weight: 600;
        color: var(--theme-color-text-primary);
        letter-spacing: 0.5px;
        text-transform: uppercase;
        opacity: 0.8;
        transition: all 0.3s ease;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &:hover {
      .label-text { opacity: 1; }
    }
  }

  .layout-body {
    display: grid;
    grid-row-gap: 6px;
    grid-template-columns: 100%;
    grid-template-rows: auto;
    overflow: hidden;
  }

  // Purely CSS-driven collapse/expand animation
  .expand-enter-active,
  .expand-leave-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 2000px;
    opacity: 1;
  }

  .expand-enter-from,
  .expand-leave-to {
    max-height: 0;
    opacity: 0;
    margin-top: -14px;
    transform: translateY(-8px);
  }

  // State: Inactive (Master switch is OFF)
  &.is-inactive {
    .status-indicator {
      background-color: var(--theme-color-gray-400);
      height: 6px;
    }
    .label-text {
      opacity: 0.3;
    }
    .layout-header {
      cursor: default;
    }
  }
}
</style>
