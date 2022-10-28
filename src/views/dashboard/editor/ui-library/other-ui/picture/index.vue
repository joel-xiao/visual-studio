<template lang="pug">
|111111
</template>

<script setup lang="ts">
import type { ComponentProps } from './../../../schema/use/interface';
interface Props {
  data: ComponentProps;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
});
</script>

<style lang="scss"></style>
