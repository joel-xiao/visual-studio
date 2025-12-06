<template>
  <div class="c-blend">
    <BasicBox ref="boxRef" type="input">
      <div ref="triggerRef" class="c-blend-select-trigger" @click="onOpenWrapper('wrapper')">
        <BasicIcon :icon="icon" :lock="lock" />
        <BasicSelect
          ref="basicSelectRef"
          :model-value="mixModel"
          :options="Items"
          :disabled="lock || !visibleModel"
          @update="onMixUpdate"
        />
      </div>
      <div class="c-blend-input">
        <BasicInput
          v-bind="$attrs"
          :model-value="opacityModel"
          :disabled="lock || !visibleModel"
          type="text"
          @update="onOpacityUpdate"
          @focus="onFocus"
          @blur="onBlur"
        />
      </div>

      <!-- Eye Icon -->
       <BasicIcon hover :icon="visibleModel ? 'icon-eye' : 'icon-eye-close'" :lock="lock" @click="toggleVisible" />
    </BasicBox>
  </div>
</template>

<script lang="ts">
export default {
  name: 'C_BLEND',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicSelect from '../../base/basic-select.vue';

interface Item {
  label: string;
  value: string | number;
  splitLine?: boolean;
}

interface IProps {
  modelValue?: {
    mix?: string;
    opacity?: string | number;
    visible?: boolean;
  };
  icon?: string;
  options?: Item[];
  lock?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => ({
    mix: '',
    opacity: '100%',
    visible: true
  }),
  icon: 'icon-opacity',
  options: () => [],
  lock: false
});

const emit = defineEmits(['update', 'update:modelValue']);

// Models
const mixModel = computed({
  get: () => props.modelValue?.mix ?? '',
  set: (val) => {
    const newValue = { ...props.modelValue, mix: val };
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const opacityModel = computed({
  get: () => props.modelValue?.opacity ?? '100%',
  set: (val) => {
    const newValue = { ...props.modelValue, opacity: val };
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

const visibleModel = computed({
  get: () => props.modelValue?.visible ?? true,
  set: (val) => {
    const newValue = { ...props.modelValue, visible: val };
    emit('update', newValue);
    emit('update:modelValue', newValue);
  }
});

// Select Logic
const Items = computed(() => props.options || []);
// enterValue removed as it is handled in BasicSelect

const boxRef = ref<null | InstanceType<typeof BasicBox>>(null);
const triggerRef = ref<null | HTMLElement>(null);
const basicSelectRef = ref<null | InstanceType<typeof BasicSelect>>(null);

function onOpenWrapper(event_type: string) {
  if (props.lock || !visibleModel.value) return;
  if (basicSelectRef.value && triggerRef.value) {
    basicSelectRef.value.open(triggerRef.value);
  }
}

function onMixUpdate(val: string | number) {
  mixModel.value = String(val);
}

// Input Logic
function onOpacityUpdate(val: string | number) {
  opacityModel.value = val;
}

function onFocus() {
  boxRef.value?.focus();
}

function onBlur() {
  boxRef.value?.blur();
}

// Eye Logic
function toggleVisible() {
  if (props.lock) return;
  visibleModel.value = !visibleModel.value;
}
</script>

<style lang="scss">
#dashboard .c-blend {
  width: 100%;

  .c-blend-select-trigger {
    display: flex;
    align-items: center;
    margin-right: 8px;
    width: 55%;
  }

  .c-blend-input {
    width: calc(45% - 24px);
  }
}
</style>
