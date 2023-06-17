<template lang="pug">
canvas.editor-panel-ruler( ref="rulerRef" :width="config.width" :height="config.height")
</template>

<script setup lang="ts">
import { ref, reactive, withDefaults, onMounted, nextTick } from 'vue';

interface Props {
  axis?: 'x' | 'y';
}

const props = withDefaults(defineProps<Props>(), {
  axis: () => 'x'
});

const config = reactive({
  width: 0,
  height: 0,

  size: 0,
  w: 0,
  h: 0,
  interval: 5,
  scale: 20,
  scaleTranslate: 4,
  offset: 16,
  color: '#fff',
  deputyColor: '#fff',
  lineWidth: 1,
  deputyLineWidth: 0.5,
  fontSize: 9
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
        drawX();
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

function drawX() {
  let ctx = rulerRef.value.getContext('2d');

  ctx.clearRect(0, 0, config.width, config.height);
  ctx.font = config.fontSize;

  let scales: number[] = [];
  for (let i = 0; i < config.size; i++) {
    let prev_scale = scales[scales.length - 1] || 0;
    if (config.interval + prev_scale === i || prev_scale === 0) scales.push(i);
  }

  for (let i = 0; i < scales.length; i++) {
    let x = config.offset;
    let y = config.offset + i * config.interval;
    let x2 = config.offset - (config.offset - config.fontSize - 2);
    let x2_max = config.offset - (config.offset - config.fontSize / 2 - 2);

    ctx.beginPath();
    ctx.moveTo(x, y);
    if (i % config.scale === 0) {
      ctx.lineWidth = config.lineWidth;
      ctx.fillStyle = config.color;
      ctx.lineTo(x2_max, y);

      if (i !== 0) {
        let scaleNumber = scales[i];
        let tx = config.fontSize,
          ty = y - config.scaleTranslate;
        ctx.translate(tx, ty);
        ctx.rotate((-90 * Math.PI) / 180);
        ctx.fillText(scaleNumber, 0, 0);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.translate(-tx, -ty);
      }
    } else if (i % (config.scale / 2) === 0) {
      ctx.lineWidth = config.lineWidth;
      ctx.strokeStyle = config.color;
      ctx.lineTo(x2, y);
    } else {
      ctx.lineWidth = config.deputyLineWidth;
      ctx.strokeStyle = config.deputyColor;
      ctx.lineTo(x2, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

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
    let x = config.offset + i * config.interval;
    let y = config.offset;
    let y2 = config.offset - (config.offset - config.fontSize - 2);
    let y2_max = config.offset - (config.offset - config.fontSize / 2 - 2);

    ctx.beginPath();
    ctx.moveTo(x, y);
    if (i % config.scale === 0) {
      ctx.lineWidth = config.lineWidth;
      ctx.fillStyle = config.color;
      ctx.lineTo(x, y2_max);
      if (i !== 0) {
        let scaleNumber = scales[i];
        ctx.fillText(scaleNumber, x + config.scaleTranslate, config.fontSize);
      }
    } else if (i % (config.scale / 2) === 0) {
      ctx.lineWidth = config.lineWidth;
      ctx.strokeStyle = config.color;
      ctx.lineTo(x, y2);
    } else {
      ctx.lineWidth = config.deputyLineWidth;
      ctx.strokeStyle = config.deputyColor;
      ctx.lineTo(x, y2);
    }
    ctx.stroke();
  }
  ctx.restore();
}
</script>

<style lang="scss">
.editor-panel-ruler {
}
</style>
