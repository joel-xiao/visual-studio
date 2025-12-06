<template>
  <div class="item-card">
    <div class="item-card-cover">
      <div class="item-card-cover_mask">
        <img :src="data?.icon" />
      </div>
    </div>
    <div class="item-card-detail">
      <span class="name ellipsis">{{ data?.label }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, withDefaults } from 'vue';

interface Props {
  data: IDbItemCard;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    icon: '',
    label: '',
    id: ''
  })
});
</script>
<style lang="scss">
#dashboard {
  #dashboard-my-project {
    .item-card {
      max-width: 300px;
      width: 100%;
      min-height: 240px;
      max-height: 240px;
      border-radius: var(--border-radius-6);
      overflow: hidden;
      padding: 6px;
      transition: 0.2s;

      &:hover {
        background: var(--db-main-color-card-bg);

        .item-card-cover_mask {
          border: 1px solid var(--theme-color-border);
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
          background: var(--db-main-color-card-bg);
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
          color: var(--theme-color-tran-85);
        }
      }
    }
  }
}
</style>
