<script setup lang="ts"></script>

<template lang="pug">
n-card(class="item-card" :bordered="false" content-style="padding: 6px;")
  div.item-card-cover
    div.item-card-cover_mask
      img(:src="data?.icon")
  div(class="item-card-detail")
    span(class="name ellipsis") {{data?.label}}
</template>
<script lang="ts" setup>
import { ref, reactive, inject, withDefaults } from 'vue';
import type { ItemCard } from './item-card.d';

interface Props {
  data: ItemCard;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
});
</script>
<style lang="scss" scoped>
.item-card {
  max-width: 300px;
  min-height: 240px;
  max-height: 240px;
  border-radius: var(--border-radius-6);
  overflow: hidden;
  &:hover {
    background: var(--color-canvas-bg);
    .item-card-cover_mask {
      border: 1px solid var(--color-border);
    }
  }

  .item-card-cover {
    display: flex;
    justify-content: center;
    align-items: space-between;
    margin: 0 auto;
    width: 100%;
    height: 180px;
    .item-card-cover_mask {
      border-radius: var(--border-radius-4);
      overflow: hidden;
      background: var(--color-canvas-bg);
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        user-select: none;
      }
    }
  }

  .item-card-detail {
    margin-top: 5px;
    height: 24px;
    font-size: 13px;
    line-height: 24px;
    padding: 0 12px;

    .name {
      font-weight: bold;
      color: var(--color-tran-85);
    }
  }
}
</style>
