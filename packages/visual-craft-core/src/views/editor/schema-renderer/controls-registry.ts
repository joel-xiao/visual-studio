import type { Component } from 'vue';

const COMPONENT_MODELS = import.meta.glob(
    ['../../ui/controls/*/index.vue', './input-group/index.vue', './blends/index.vue', './conditions/index.vue'],
    { eager: true, import: 'default' }
);

const components: Record<string, Component> = {};
Object.values(COMPONENT_MODELS).forEach((comp: unknown) => {
    const component = comp as Component & { name?: string };
    if (component?.name) components[component.name] = component;
});

export const getControlComponent = (name: string) => components[name];
