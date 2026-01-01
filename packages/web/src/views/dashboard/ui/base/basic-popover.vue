<template>
  <Popover v-bind="$attrs">
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <slot></slot>
  </Popover>
</template>

<script setup lang="ts"></script>

