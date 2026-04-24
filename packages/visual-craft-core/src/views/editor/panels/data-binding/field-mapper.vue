<template>
  <div class="field-mapper">
    <div class="mapper-header">
      <div class="col field">字段</div>
      <div class="col mapping">映射</div>
      <div class="col status">状态</div>
    </div>
    <div class="mapper-body">
      <div v-for="item in mappings" :key="item.field" class="mapper-row">
        <div class="col field">{{ item.field }}</div>
          <CInput v-model:model-value="item.mapping" class="col mapping" size="small" placeholder="输入映射字段..." />
        <div class="col status">
          <CIcon :icon="item.status === 'success' ? 'mdi:check-circle' : 'mdi:close-circle'" 
                :style="{ color: item.status === 'success' ? '#4caf50' : '#f44336' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CInput from '@/views/ui/controls/c-input/index.vue';
import CIcon from '@/views/ui/controls/c-icon/index.vue';

defineProps<{
  mappings: any[];
  pattern?: string;
}>();
</script>

<style lang="scss" scoped>
.field-mapper {
  background: var(--theme-color-gray-100);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;

  .mapper-header {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 10px;
    font-size: 11px;
    color: var(--theme-color-tran-45);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .mapper-row {
    display: flex;
    align-items: center;
    padding: 4px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    font-size: 12px;
    
    &:last-child { border-bottom: none; }
  }

  .col {
    &.field { width: 80px; }
    &.mapping { flex: 1; margin: 0 12px; }
    &.status { width: 30px; display: flex; justify-content: center; }
  }
}
</style>
