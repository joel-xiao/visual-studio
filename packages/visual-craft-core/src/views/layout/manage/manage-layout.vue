<script setup lang="ts">
import CInput from '@/views/ui/controls/c-input/index.vue';
import NavTree from '@/components/nav-tree/index.vue';
import Icon from '@/components/icon/index.vue';
import { computed, ref } from 'vue';
import { getUuid } from '@/assets/utils/index';
import { getManageIcon } from 'virtual:visual-craft-core-public-assets';

const defaultFolderIcon = getManageIcon('folder.svg');

type IDbLayoutNewProjectData = {
  name: string;
  icon: string;
  id: string;
};

type DbLayoutCreateProject = {
  folder: ITreeItemData | undefined;
  project: ITreeItemData;
  item: IDbLayoutNewProjectData;
};

interface Props {
  title?: string;
  folderTree?: ITreeItemData[];
  folderMenus?: ITreeItemMenu[];
  buttons?: IDbLayoutNewProjectData[];
  itemIcon?: string;
  currentFolderId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  folderTree: () => [],
  folderMenus: () => [],
  buttons: () => [],
  itemIcon: '',
  currentFolderId: ''
});

const emits = defineEmits<{
  (e: 'folder-select', folder: ITreeItemData): void;
  (e: 'button-click', data: DbLayoutCreateProject): void;
}>();

const navRef = ref<InstanceType<typeof NavTree>>();

const resolvedItemIcon = computed(() => {
  return props.itemIcon || defaultFolderIcon;
});

const currentFolder = computed<ITreeItemData | undefined>(() => {
  if (!props.folderTree.length) return undefined;
  if (props.currentFolderId) {
    const queue: ITreeItemData[] = [...props.folderTree];
    while (queue.length) {
      const node = queue.shift();
      if (!node) continue;
      if (node.id === props.currentFolderId) return node;
      if (node.children?.length) queue.push(...node.children);
    }
  }
  return props.folderTree[0];
});

function selectFolder(folder: ITreeItemData): void {
  emits('folder-select', folder);
}

function onButton(item: IDbLayoutNewProjectData): void {
  const project: ITreeItemData = { name: '未命名', id: getUuid(), sum: 0 };
  emits('button-click', {
    folder: currentFolder.value,
    project,
    item
  });
}
</script>

<template>
  <div id="visual-craft-core-project">
    <div class="project-manage left">
      <div class="manage-title">
        <span>{{ props.title }}</span>
        <Icon src="icon-jiahao" class="add-group" button size="small" />
      </div>
      <NavTree
        ref="navRef"
        :data="props.folderTree"
        :item-icon="resolvedItemIcon"
        size="small"
        :item-menus="props.folderMenus"
        @select="selectFolder"
      />
    </div>

    <div class="project-screen-list left">
      <div class="new-projects">
        <div
          v-for="item in props.buttons"
          :key="item.id"
          class="new-project"
          @click="onButton(item)"
        >
          <img v-if="item.icon" :src="item.icon" />
          <span class="ellipsis project-type">{{ item.name }}</span>
          <Icon src="icon-jiahao" font-size="16px" />
        </div>
      </div>

      <div class="projects-search">
        <div class="search">
          <CInput placeholder="搜索项目..." :focus="false" icon="icon-sousuo" />
        </div>
      </div>

      <div class="project-header">
        <div class="project-title">
          <h2 class="ellipsis">
            {{
              currentFolder?.cascades
                ? currentFolder?.cascades.map((item) => item.name).join(' / ')
                : ''
            }}
          </h2>
          <span v-if="currentFolder?.sum" class="projects-sum">
            <span class="projects-number">{{ currentFolder?.sum || '0' }}</span>
            个
          </span>
        </div>
      </div>

      <div class="projects-content">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#visual-craft-core-project {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  min-width: 0;

  .project-manage {
    width: 300px;
    flex: none;
    height: 100%;
    padding: 8px;
    background: var(--db-main-color-left-bar-bg);
    z-index: 1;

    .manage-title {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      padding-right: 4px;
      padding-left: 20px;
      color: var(--theme-color-tran-85);
      border-radius: var(--border-radius-6);

      .add-group {
        opacity: 0;
        transition: opacity 0.15s;
      }

      &:hover {
        background-color: var(--theme-color-gray-100);

        .add-group {
          opacity: 1;
        }
      }
    }
  }

  .manage-main {
    .main-project {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 36px;
      padding: 0 30px 0 50px;
      font-size: 14px;
      color: #b9c2cc;
      transition: all 0.2s;

      &.active {
        color: #fff;
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            var(--theme-color-tran-12),
            var(--theme-color-tran-6),
            transparent
          );
          z-index: -1;
        }
      }

      &:not(.all, .no-group),
      &.no-group .project-num {
        font-size: 12px;
      }
    }
  }

  .project-screen-list {
    z-index: 0;
    width: calc(100% - 300px);
    min-width: 0;
    height: 100%;
    padding: 0;
    position: relative;
    display: flex;
    flex-direction: column;

      .new-projects {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 24px 32px;
        row-gap: 16px;
        column-gap: 16px;

      .new-project {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 284px;
        border-radius: 8px;
        height: 64px;
        box-sizing: border-box;
        padding: 0 16px;
        color: var(--theme-color-text-bold);
        vertical-align: middle;
        border: 1px solid var(--theme-color-border);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border: 1px solid var(--theme-color-gray-100);
          background-color: var(--theme-color-gray-100);
        }

        img {
          max-height: 100%;
          max-width: 58px;
        }

        .project-type {
          flex: 1;
          padding-left: 8px;
          font-size: 14px;
        }
      }
    }

    .projects-search {
      display: flex;
      align-items: center;
      height: 32px;
      position: absolute;
      top: -40px;
      left: 36px;

      .search {
        width: 340px;
        height: 100%;

        .n-input {
          height: 100%;
          border-radius: var(--border-radius-8);
        }
      }
    }

    .project-header {
      position: sticky;
      z-index: 1;
      display: flex;
      align-items: center;
      height: 36px;
      margin: 0 6px;
      padding: 0 26px; // Adjust for 32px total padding
      margin-top: 8px;
      margin-bottom: 4px;

      .project-title {
        display: flex;
        align-items: center;
        margin-right: 20px;
        flex: none;

        h2 {
          font-size: 16px;
          color: var(--theme-color-text);
        }

        span.projects-sum {
          padding-left: 6px;
          font-size: 14px;
          letter-spacing: 1px;

          .projects-number {
            padding: 0 2px;
          }
        }
      }
    }

    .projects-content {
      width: 100%;
      flex: 1;
      overflow-y: auto;
      padding-right: 0;
    }
  }
}
</style>
