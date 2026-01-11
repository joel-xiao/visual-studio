<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue';
import Icon from '@/components/icon/index.vue';
import { useContextMenu, type ContextMenuItem } from '../hooks/context-menu';

const contextMenu = useContextMenu();
const state = contextMenu.state;

const menuRef = ref<HTMLElement | null>(null);

const closeMenu = () => {
  contextMenu.close();
};

const handleAction = (item: ContextMenuItem) => {
  if (item.disabled || item.divider) return;
  if (item.action) {
    item.action();
  }
  closeMenu();
};

const menuStyle = computed(() => {
  const x = state.x;
  const y = state.y;

  const style: CSSProperties = {
    left: `${x}px`,
    top: `${y}px`,
    position: 'fixed',
    zIndex: 99999,
    maxHeight: 'none'
  };

  if (menuRef.value) {
    const rect = menuRef.value.getBoundingClientRect();
    const vPortW = window.innerWidth;
    const vPortH = window.innerHeight;
    const margin = 12;

    if (x + rect.width > vPortW - margin) {
      style.left = `${Math.max(margin, vPortW - rect.width - margin)}px`;
    }

    const spaceBelow = vPortH - y - margin;
    const spaceAbove = y - margin;

    if (rect.height > spaceBelow) {
      if (spaceAbove > spaceBelow) {
        if (rect.height > spaceAbove) {
          style.top = `${margin}px`;
          style.maxHeight = `${spaceAbove}px`;
        } else {
          style.top = `${y - rect.height}px`;
        }
      } else {
        style.maxHeight = `${spaceBelow}px`;
      }
    } else {
      style.maxHeight = `${vPortH - y - margin}px`;
    }
  }

  return style;
});

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside, { capture: true });
});

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside, { capture: true });
});

const handleClickOutside = (e: MouseEvent) => {
  if (e.button !== 0) return;

  if (state.show && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu();
  }
};

const activeSubMenu = ref<string | null>(null);
const activeSubMenuTop = ref(0);

const activeSubMenuData = computed(() => {
  if (!activeSubMenu.value) return null;
  return state.items.find(item => item.id === activeSubMenu.value)?.children || null;
});

const onMouseEnter = (item: ContextMenuItem, event: MouseEvent) => {
  if (item.children && !item.disabled) {
    activeSubMenu.value = item.id;
    const target = event.currentTarget as HTMLElement;
    if (target) {
      activeSubMenuTop.value = target.offsetTop;
    }
  } else {
    activeSubMenu.value = null;
  }
};

</script>

<template>
  <Transition name="menu-fade">
    <div
      v-if="state.show"
      ref="menuRef"
      class="basic-context-menu"
      :style="menuStyle"
      @contextmenu.prevent.stop
      @mouseleave="activeSubMenu = null"
    >
      <div class="menu-scroll-container">
        <div class="menu-list">
          <template v-for="item in state.items" :key="item.id">
            <div v-if="item.divider" class="menu-divider"></div>
            <div
              v-else
              class="menu-item"
              :class="{
                disabled: item.disabled,
                'has-children': item.children?.length,
                'is-active': activeSubMenu === item.id
              }"
              :style="{ paddingLeft: (item.level ? (item.level * 16 + 4) : 4) + 'px' }"
              @click.stop="handleAction(item)"
              @mouseenter="onMouseEnter(item, $event)"
            >
              <div class="item-content">
                <div class="item-visual-zone">
                  <div class="item-check">
                    <Icon v-if="item.checked" src="lucide:check" />
                  </div>
                  <div class="item-icon-box">
                    <Icon v-if="item.icon" :src="item.icon" />
                  </div>
                </div>

                <span class="item-label">{{ item.label }}</span>

                <div v-if="item.shortcuts?.length" class="item-shortcut">
                  <template v-for="(s, index) in item.shortcuts" :key="index">
                    <span v-if="s.icon || s.label" class="shortcut-key">
                      <Icon v-if="s.icon" :src="s.icon" class="shortcut-icon" />
                      <template v-else>{{ s.label }}</template>
                    </span>
                  </template>
                </div>

                <div class="item-arrow-box">
                  <Icon v-if="item.children?.length" src="lucide:chevron-right" class="item-arrow" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div
        v-if="activeSubMenuData"
        class="submenu-wrapper"
        :style="{ top: `${activeSubMenuTop - 4}px` }"
        @mouseenter="activeSubMenu = activeSubMenu"
        @mouseleave="activeSubMenu = null"
      >
        <div class="menu-list sub-list">
          <template v-for="child in activeSubMenuData" :key="child.id">
            <div v-if="child.divider" class="menu-divider"></div>
            <div
              v-else
              class="menu-item"
              :class="{ disabled: child.disabled }"
              :style="{ paddingLeft: (child.level ? (child.level * 16 + 4) : 4) + 'px' }"
              @click.stop="handleAction(child)"
            >
              <div class="item-content">
                <div class="item-visual-zone">
                  <div class="item-check">
                    <Icon v-if="child.checked" src="lucide:check" />
                  </div>
                  <div class="item-icon-box">
                    <Icon v-if="child.icon" :src="child.icon" />
                  </div>
                </div>

                <span class="item-label">{{ child.label }}</span>

                <div v-if="child.shortcuts?.length" class="item-shortcut">
                  <template v-for="(s, index) in child.shortcuts" :key="index">
                    <span v-if="s.icon || s.label" class="shortcut-key">
                      <Icon v-if="s.icon" :src="s.icon" class="shortcut-icon" />
                      <template v-else>{{ s.label }}</template>
                    </span>
                  </template>
                </div>

                <div class="item-arrow-box">
                  <Icon v-if="child.children?.length" src="lucide:chevron-right" class="item-arrow" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.basic-context-menu {
  position: fixed;
  z-index: 100000;
  min-width: 160px;
  max-width: 300px;
  background: var(--db-menu-bg);
  backdrop-filter: var(--db-menu-blur) saturate(180%);
  -webkit-backdrop-filter: var(--db-menu-blur) saturate(180%);
  border: 1px solid var(--db-menu-border);
  border-radius: 8px;
  box-shadow: var(--db-menu-shadow);
  padding: 4px;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.menu-scroll-container {
  overflow-y: auto;
  overflow-x: visible;
  max-height: inherit;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.menu-item {
  position: relative;
  padding: 0 4px;
  height: 26px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &.is-active,
  &:hover:not(.disabled) {
    background: var(--db-menu-item-hover);
    .item-label { color: #fff; }
    .item-icon-box { color: #fff; opacity: 1; }
    .item-arrow { color: #fff; opacity: 0.8; }
    .shortcut-key {
      color: #fff;
      background: rgba(255, 255, 255, 0.25);
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }
}

.item-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.item-visual-zone {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 8px;
}

.item-check {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 2px;
}

.item-icon-box {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--db-menu-text);
  opacity: 0.8;

  :deep(svg), :deep(img) {
    width: 13px;
    height: 13px;
  }
}

.item-label {
  flex: 1;
  font-size: 12px;
  color: var(--db-menu-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.item-shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 24px;
}

.shortcut-key {
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  padding: 0 2px;
  border-radius: 4px;
  width: 16px;
  height: 16px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  transition: all 0.15s ease;
}

.shortcut-icon {
  font-size: 11px;
}

.item-arrow-box {
  width: 16px;
  height: 16px;
  margin-left: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-arrow {
  width: 14px;
  height: 14px;
  color: var(--db-menu-text);
  opacity: 0.4;
}

.menu-divider {
  height: 1px;
  background: var(--db-menu-divider);
  margin: 3px 4px;
}

.submenu-wrapper {
  position: absolute;
  left: calc(100% + 2px);
  z-index: 100001;
  pointer-events: auto;

  .sub-list {
    background: var(--db-menu-bg);
    backdrop-filter: blur(25px);
    border: 1px solid var(--db-menu-border);
    border-radius: 8px;
    box-shadow: var(--db-menu-shadow);
    padding: 4px;
    min-width: 140px;
  }
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease-out;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>


