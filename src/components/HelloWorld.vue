<script setup lang="ts">
// import { computed } from 'vue';
// import { useStore } from 'vuex';
// import { key } from '@/store';
defineProps<{ msg: string }>();

// const store = useStore(key);
// const count = computed(() => store.state.count);
// const inCrement = () => store.commit('increment');
</script>

<template>
  <h1>{{ msg }}</h1>
  <!-- <button @click="inCrement">count is:</button>
  <p>{{ count }}</p>-->
</template>

<style scoped></style>
