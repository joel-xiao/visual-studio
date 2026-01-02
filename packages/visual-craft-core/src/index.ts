import './assets/style/index.scss';

export { default as Editor } from './views/editor/index.vue';
export { default as CoreMainLayout } from './views/layout/main/index.vue';
export { default as CoreProjectsLayout } from './views/layout/projects/index.vue';
export { default as CoreDataLayout } from './views/layout/data/index.vue';
export { default as monaco } from './plugins/monaco-editor';

export * from './hooks/vue-hooks';
export * from './hooks/drag-hook';
export * from './server';
