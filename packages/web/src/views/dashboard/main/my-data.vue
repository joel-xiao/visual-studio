<script setup lang="ts">
import { DataCenter, cMessage, cDialog } from 'visual-craft-core';
import { ref, onMounted } from 'vue';
import { dataCenterApi } from '@/service/api/data-center';

const dataSourceList = ref<any[]>([]);
const currentResponse = ref<any>(null);

onMounted(async () => {
  await fetchSources();
});

async function fetchSources() {
  try {
    const res = await dataCenterApi.getSources();
    dataSourceList.value = res.data || [];
  } catch (e: any) {
    console.error('Failed to fetch data sources', e);
  }
}

async function handleSave(config: any) {
  try {
    await dataCenterApi.saveSource(config);
    await fetchSources(); // Refresh list
    cMessage.success('保存成功');
  } catch (e: any) {
    console.error('Save failed', e);
    cMessage.error('保存失败: ' + (e.msg || e.message));
  }
}

async function handleTest(config: any) {
  try {
    const res = await dataCenterApi.testSource(config);
    currentResponse.value = res.data; // This will flow back to the editor via props if passed
    cMessage.info('测试执行完毕');
  } catch (e: any) {
    console.error('Test failed', e);
    currentResponse.value = { error: e.message };
    cMessage.error('测试失败: ' + (e.msg || e.message));
  }
}

async function handleDelete(id: string) {
    const confirmed = await cDialog.confirm({
        title: '删除确认',
        content: '确定要删除该数据源吗？此操作不可恢复。',
        type: 'warning'
    });
    
    if (confirmed) {
        try {
            await dataCenterApi.deleteSource(id);
            await fetchSources();
            cMessage.success('删除成功');
        } catch (e: any) {
            console.error('Delete failed', e);
            cMessage.error('删除失败');
        }
    }
}
</script>

<template>
  <DataCenter
    :data-source-list="dataSourceList"
    :response="currentResponse"
    @save="handleSave"
    @test="handleTest"
    @delete="handleDelete"
  />
</template>

<style lang="scss">
.data-type {
  font-weight: 600;
  display: block;
  width: 34px;

  &.get {
    color: var(--db-main-color-get);
  }

  &.post {
    color: var(--db-main-color-post);
  }
}
</style>
