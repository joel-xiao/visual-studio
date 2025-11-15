<template lang="pug">
img( class="controls_picture" src="https://picsum.photos/seed/picsum/300" alt="picture" )
</template>

<script setup lang="ts">
interface Props {
  data: IComponentProps;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
});
</script>

<style lang="scss">
.controls_picture {
  height: var(--node-height);
  width: var(--node-width);
}
</style>
