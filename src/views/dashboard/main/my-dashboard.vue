<script setup lang="ts">
import ItemCard from './components/item-card.vue';
import { ref, reactive, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import type { TreeItemMenu, TreeItemData } from '@/components/nav-tree/interface';
import { useDashboardStore } from '@/store/dashboard';
import visual from '@s/visual/visual';
import type { IVisualProjectsResponse } from '@s/visual/types';
const router = useRouter();

const folderTreeList: TreeItemData[] = reactive([
  { name: '全部应用', id: 'all', sum: 0, handle: false },
  { name: '未分组', id: 'no-group', sum: 0, handle: false },
  {
    name: 'xiao',
    id: '123',
    sum: 0,
    children: [
      { name: '全部应用', id: '1all', sum: 0 },
      { name: '未分组', id: '1no-group', sum: 0 },
      { name: '其他', id: '1123', sum: 0 }
    ]
  }
]);
const currentFolder = ref<TreeItemData>(folderTreeList[0]);
const onSelectFolder = function (folder: TreeItemData): void {
  currentFolder.value = folder;
};

const folderMenus = reactive<TreeItemMenu[]>(
  markRaw([
    {
      name: '更多',
      id: 'more',
      icon: 'icon-dian',
      disabled: true,
      children: [
        { name: '编辑', id: 'edit', icon: 'icon-bianji', disabled: true },
        { name: '删除', id: 'delete', icon: 'icon-delete', disabled: true }
      ]
    },
    { name: '添加组', id: 'add', icon: 'icon-jiahao', disabled: true }
  ])
);

interface newProjectData {
  name: string;
  icon: string;
  id: string;
}
const newProjectList: newProjectData[] = reactive(
  markRaw([
    { name: 'PC端创建', id: 'web', icon: 'new-project-web.png' },
    { name: '移动端创建', id: 'mobile', icon: 'new-project-mobile.png' }
  ])
);

let { saveCrumbs } = useDashboardStore();

const onNewProject = function (): void {
  let project: TreeItemData = { name: '未命名', id: '2all', sum: 0 };
  if (currentFolder.value.children) {
    currentFolder.value.AFold = true;
    currentFolder.value.children.push(project);
  }
  saveCrumbs([...(currentFolder.value?.cascades || []), project]);
  router.push('/dashboard/editor');
};

let projects = ref<IVisualProjectsResponse['data']>([]);
visual.getVisualProjects('23').then((res) => {
  projects.value = res.data || [];
});
</script>

<template lang="pug">
div#dashboard-my-project
  div(class='project-manage left')
    NavTree(
      :data="folderTreeList"
      itemIcon="icon-wenjianjia"
      :itemMenus="folderMenus"
      @select="onSelectFolder")
  div(class="project-screen-list right")
    //- div.new-projects
    //-     div.new-project(
    //-         v-for="(item, idx) in newProjectList"
    //-         :key="item.id")
    //-         img(:src="'@a/img/dashboard/main/' + item.icon")
    //-         span.ellipsis.project-type {{item.name}}
    div.new-projects
      n-button(type="primary" @click.stop.prevent="onNewProject") 新建
      div.search
        NInput(placeholder="搜索")
          template(#prefix)
            Icon(src='icon-sousuo')
    div.project-header
      div.project-title
        h2.ellipsis {{ currentFolder.name }}
        span.projects-sum
          span.projects-number {{ currentFolder.sum }}
          |个
    div.projects-content
      ItemCard(v-for="(item, idx) in projects" :data="item" :key="item.id + '_' + idx")

  Loading

</template>

<style lang="scss">
#dashboard {
  #dashboard-my-project {
    position: relative;
    width: 100%;
    height: 100%;

    .project-manage {
      width: 264px;
      height: 100%;
      padding: 8px;
      background: var(--theme-color-left-bar-bg);
      z-index: 1;

      .manage-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        padding: 0 30px 0 24px;
        font-size: 14px;
        color: #fff;
        border-bottom: 1px solid #27343e;

        .add-group {
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
    }

    .project-screen-list {
      z-index: 0;
      width: calc(100% - 264px);
      height: 100%;
      padding: 10px 16px;

      .new-projects {
        display: flex;
        align-items: center;
        height: 32px;

        .n-button {
          width: 113px;
        }
        .search {
          width: 100%;
          padding-left: 16px;
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
            max-width: 200px;
            font-size: 16px;
            color: var(--color-text);
          }

          span.projects-sum {
            padding-left: 6px;
            font-size: 14px;
            color: #bcc9d4;
            letter-spacing: 1px;
            .projects-number {
              padding: 0 2px;
            }
          }
        }
      }

      .projects-content {
        display: flex;
      }

      /* .new-projects {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      margin-right: -32px;

      .new-project {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 258px;
        height: 78px;
        margin-top: 4px;
        margin-right: 10px;
        color: #fff;
        vertical-align: middle;
        cursor: pointer;
        background: #22272e;
        border: 1px solid #39414d;

        &:hover {
          border-color: var(--dashboard-main-color);

          &::after {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            content: ' ';
            background: rgb(36 131 255 / 8%);
          }
        }

        img {
          height: 100%;
        }

        .project-type {
          flex: 1;
          padding-left: 8px;
          font-size: 14px;
        }
      }
    }
    } */
    }
  }
}
</style>
