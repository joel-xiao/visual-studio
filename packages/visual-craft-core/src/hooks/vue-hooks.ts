import { Component, createVNode, render, VNode } from 'vue';

export const createComponent = function <T>(
  key: string,
  parentEl: HTMLElement | undefined,
  component: Component,
  prop: T | void
): { vnode: VNode; unmount: () => void } {
  // 创建虚拟节点（VNode），并传入 props
  const vnode = createVNode(component, { ...(prop && prop instanceof Object ? prop : {}) });

  // 创建容器元素，如果 parentEl 未定义则抛出异常
  if (!parentEl) {
    throw new Error('Parent element is not defined');
  }

  const el: HTMLElement = document.createElement('div');
  el.setAttribute('key', key);
  el.setAttribute('type', 'component');
  parentEl.appendChild(el);

  // 手动渲染虚拟节点到指定的容器
  render(vnode, el);

  // 自定义卸载方法，带清理操作
  const unmount = () => {
    render(null, el); // 销毁 VNode，并解除与 DOM 的绑定
    if (el && parentEl.contains(el)) {
      parentEl.removeChild(el); // 从父元素中移除容器
    }
  };

  return { vnode, unmount };
};
