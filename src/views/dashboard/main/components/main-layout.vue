<script setup lang="ts">
import CInput from './../../components/basic/c-input/index.vue';
import { ref, reactive, markRaw, defineEmits } from 'vue';
import { getUuid } from '@a/utils/index';
import type {
  ITreeItemMenu,
  ITreeItemData,
  ILayoutOption,
  ILayoutNewProjectData,
  LayoutCreateProject
} from './types.d';

const emits = defineEmits<{
  (e: 'button-click', data: LayoutCreateProject): void;
}>();

let option = reactive<ILayoutOption>({});

function setOption(opt: ILayoutOption) {
  option = opt;
  opt.folderTree && setFolderTree(opt.folderTree);
  opt.folderMenus && setFolderTree(opt.folderMenus);
  opt.buttons && setButtons(opt.buttons);
}

function clearOption() {
  clearFolderTree();
  clearFolderMenus();
  clearButtons();
}

const folderTree = ref<ITreeItemData[]>([]);
const currentFolder = ref<ITreeItemData>();
const navRef = ref();
function setFolderTree(data: ITreeItemData[]) {
  folderTree.value = Array.isArray(data) ? data : [];
  navRef.value?.setSelect(folderTree.value[0]);
}

function clearFolderTree() {
  folderTree.value = [];
}

function selectFolder(folder: ITreeItemData): void {
  currentFolder.value = folder;
}

const folderMenus = ref<ITreeItemMenu[]>([]);

function setFolderMenus(data: ITreeItemMenu[]) {
  folderMenus.value = markRaw(Array.isArray(data) ? data : []);
}

function clearFolderMenus() {
  folderMenus.value = [];
}

const buttons = ref<ILayoutNewProjectData[]>([]);

function setButtons(data: ILayoutNewProjectData[]) {
  buttons.value = markRaw(Array.isArray(data) ? data : []);
}

function clearButtons() {
  buttons.value = [];
}

function onButton(item: ILayoutNewProjectData): void {
  let project: ITreeItemData = { name: '未命名', id: getUuid(), sum: 0 };
  if (currentFolder.value?.children) {
    currentFolder.value.AFold = true;
    currentFolder.value.children.push(project);
    currentFolder.value.cascades.push(project);
  }
  emits('button-click', {
    folder: currentFolder.value,
    project,
    item
  });
}

defineExpose({
  setOption,
  clearOption,

  setFolderTree,
  clearFolderTree,
  selectFolder,

  setFolderMenus,
  clearFolderMenus,

  setButtons,
  clearButtons
});
</script>

<template lang="pug">
div#dashboard-my-project
  div(class='project-manage left')
    div.manage-title
      span 我的项目
      Icon(src="icon-jiahao" class="add-group" button size="small")
    NavTree(
      :data="folderTree"
      itemIcon="/image/dashboard/my-main/folder.svg"
      size='small'
      :itemMenus="folderMenus"
      ref="navRef"
      @select="selectFolder")

  div(class="project-screen-list left")
    div.new-projects
      div.new-project(
          v-for="(item, idx) in buttons"
          @click="onButton(item)"
          :key="item.id")
          img(v-if="item.icon" :src="'@a/img/dashboard/main/' + item.icon")
          span.ellipsis.project-type {{item.name}}
          Icon(src='icon-jiahao' font-size="16px")

    div.projects-search
      div.search
        CInput(placeholder="搜索项目..." :focus="false"  icon="icon-sousuo")

    div.project-header
      div.project-title
        h2.ellipsis {{ currentFolder?.cascades ? currentFolder?.cascades.map( item => item.name).join(' / ') : '' }}
        span.projects-sum(v-if="currentFolder?.sum")
          span.projects-number {{ currentFolder?.sum || '0' }}
          |个

    div.projects-content
      slot(name="content")
  //- Loading

</template>

<style lang="scss">
#dashboard {
  #dashboard-my-project {
    position: relative;
    width: 100%;
    height: 100%;

    .project-manage {
      width: 300px;
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
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 36px;
        padding: 0 30px 0 50px;
        font-size: 14px;
        color: #b9c2cc;
        transition: all 0.2s;

        &:hover {
          /* color: var(--dashboard-main-color); */
        }

        &.active {
          color: #fff;
          background: url(`~@/assets/img/dashboard/main/my-project-check.png`);
          background-repeat: round;
          background-size: contain;
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
      height: 100%;
      padding: 24px 32px;
      position: relative;

      .new-projects {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-bottom: 24px;
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
    }
  }
}
</style>
