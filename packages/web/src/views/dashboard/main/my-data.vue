<script setup lang="ts">
import { DataCenter } from 'visual-craft-core';
import { ref, onMounted } from 'vue';
import { dataCenterApi } from '@/service/api/data-center';

const dataSourceList = ref([]);
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
    alert('保存成功');
  } catch (e: any) {
    console.error('Save failed', e);
  }
}

async function handleTest(config: any) {
  try {
    const res = await dataCenterApi.testSource(config);
    currentResponse.value = res.data; // This will flow back to the editor via props if passed
  } catch (e: any) {
    console.error('Test failed', e);
    currentResponse.value = { error: e.message };
  }
}

function handleDelete(id: string) {
    console.log('Delete requested', id);
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
