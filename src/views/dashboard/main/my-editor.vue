<template lang="pug">
Editor
</template>

<script setup lang="ts">
import Editor from '../editor/index.vue';
import type { EditorData } from '../editor/hooks/node-context/interface';
import { ref, reactive } from 'vue';

// const data = reactive<EditorData>({
//   folder: '',
//   id: '',
//   type: '',
//   name: '',
//   nodes: [
//     {
//       id: 'root',
//       name: '根容器',
//       width: 1920,
//       height: 1080,
//       x: 0,
//       y: 0
//     }
//   ]
// });
</script>

<style lang="scss" scoped></style>
