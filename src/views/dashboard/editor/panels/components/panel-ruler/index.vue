<template lang="pug">
canvas.editor-panel-ruler( ref="rulerRef" :width="config.width" :height="config.height")
</template>

<script setup lang="ts">
import { ref, reactive, withDefaults, onMounted, nextTick } from 'vue';

interface Props {
  axis?: 'x' | 'y';
}

const props = withDefaults(defineProps<Props>(), {
  axis: () => 'y'
});

const config = reactive({
  width: 0,
  height: 0,

  size: 0,
  w: 0,
  h: 0,
  interval: 5,
  scale: 20,

  offset: 20,
  color: '#fff',
  deputyColor: '#fff',
  lineWidth: 1,
  deputyLineWidth: 0.5,
  fontSize: 12
});
const rulerRef = ref();

onMounted(() => {
  draw();
});

function draw() {
  let rect = rulerRef.value.parentNode.getBoundingClientRect() || {
    width: window.innerWidth,
    height: window.innerHeight
  };

  switch (props.axis) {
    case 'x':
      config.width = config.offset;
      config.height = rect.height;
      config.size = rect.height;
      nextTick(() => {
        // drawX();
      });
      break;
    case 'y':
      config.width = rect.width;
      config.height = config.offset;
      config.size = rect.width;
      nextTick(() => {
        drawY();
      });
      break;
    default:
      break;
  }
}

// function drawX() {}

function drawY() {
  let ctx = rulerRef.value.getContext('2d');

  ctx.clearRect(0, 0, config.width, config.height);
  ctx.font = config.fontSize;

  let scales: number[] = [];
  for (let i = 0; i < config.size; i++) {
    let prev_scale = scales[scales.length - 1] || 0;
    if (config.interval + prev_scale === i || prev_scale === 0) scales.push(i);
  }

  for (let i = 0; i < scales.length; i++) {
    let x = i * config.interval;
    let y = config.offset / 3.5;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    if (i % config.scale === 0) {
      ctx.lineWidth = config.lineWidth;
      ctx.fillStyle = config.color;
      let scaleNumber = scales[i];
      ctx.fillText(scaleNumber, x + 4, config.offset - 5);
      ctx.lineTo(x, config.offset / 1.6);
    } else if (i % (config.scale / 2) === 0) {
      ctx.lineWidth = config.lineWidth;
      ctx.strokeStyle = config.color;
      ctx.lineTo(x, y);
    } else {
      ctx.lineWidth = config.deputyLineWidth;
      ctx.strokeStyle = config.deputyColor;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
</script>

<style lang="scss">
.editor-panel-ruler {
}
</style>
