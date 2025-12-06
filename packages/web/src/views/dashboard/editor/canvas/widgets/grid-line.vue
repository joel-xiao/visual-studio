<template>
<svg class="grid" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="smallGrid"
        width="1"
        height="1"
        patternUnits="userSpaceOnUse">
      <path d="M 1 0 L 0 0 0 1"
          fill="none"
          stroke="#fff"
          stroke-width="0.001" />
    </pattern>
    <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
      <rect width="1" height="1" fill="url(#smallGrid)" />
      <path d="M 1 0 L 0 0 0 1"
        fill="none"
        stroke="#fff"
        stroke-width="0.001" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
</svg>
</template>

<style lang="scss">
#editor {
  .grid {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.4;
  }
}
</style>
