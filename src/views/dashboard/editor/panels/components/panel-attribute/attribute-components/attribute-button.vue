<template lang="pug">
BasicButtonBox(@click="onClick" key="attribute-button")
  BasicIcon
</template>

<script setup lang="ts">
import BasicButtonBox from './../basic-components/basic-button-box.vue';
import BasicIcon from './../basic-components/basic-icon.vue';

const onClick = function () {
  console.log('onClick');
};
</script>

<style lang="scss"></style>
