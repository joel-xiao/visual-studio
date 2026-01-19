<template>
  <svg class="editor-guide-lines" :style="{ '--scale': scale }" preserveAspectRatio="none">
    <!-- Alignment Lines (Dashed) -->
    <line
      v-for="(line, index) in lines"
      :key="'line-' + index"
      class="guide-line dashed"
      v-bind="getLineCoords(line)"
    />

    <!-- Measurement Groups -->
    <g v-for="(item, index) in measurements" :key="'meas-' + index" class="measurement-group">
      <!-- Extension Lines (Dashed) - Start -->
      <line
        v-if="item.startExtend"
        class="guide-line extension-dashed"
        v-bind="getExtensionCoords(item, 'start')"
      />
      <!-- Extension Lines (Dashed) - End -->
      <line
        v-if="item.endExtend"
        class="guide-line extension-dashed"
        v-bind="getExtensionCoords(item, 'end')"
      />

      <!-- Main Measurement Line (Solid) -->
      <line class="guide-line solid" v-bind="getMeasurementCoords(item)" />

      <!-- X Markers -->
      <g :transform="getMarkerTransform(item, 'start')" class="x-marker">
        <path d="M-2.5 -2.5 L2.5 2.5 M2.5 -2.5 L-2.5 2.5" />
      </g>
      <g :transform="getMarkerTransform(item, 'end')" class="x-marker">
        <path d="M-2.5 -2.5 L2.5 2.5 M2.5 -2.5 L-2.5 2.5" />
      </g>

      <!-- Label -->
      <foreignObject
        :x="getLabelPos(item).x - 100"
        :y="getLabelPos(item).y - 50"
        width="200"
        height="100"
        class="label-container"
      >
        <div class="label-wrapper">
          <div class="measurement-label">
            {{ item.value }}
          </div>
        </div>
      </foreignObject>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { useAlignment, type AlignmentLine, type MeasurementLine } from '../../hooks/ruler-context/alignment';
import { useCanvas } from '../../hooks/canvas';
import { ref, onMounted, onUnmounted, computed } from 'vue';

const alignment = useAlignment();
const lines = alignment.getLines();
const measurements = alignment.getMeasurements();

const { addCanvasUpdated, removeCanvasUpdated, getScale } = useCanvas();

// We don't really need a reactive scale for coordinates if we use a proper viewBox
// But we might need it for font sizes and marker sizes if we don't want them to scale
const scale = ref(getScale());
const updateScale = (state: { scale: number }) => {
  scale.value = state.scale;
};

onMounted(() => {
  addCanvasUpdated(updateScale);
});

onUnmounted(() => {
  removeCanvasUpdated(updateScale);
});

// Assuming canvas size is large enough, or we can use a dynamic viewBox if needed
// For now, let's assume coordinates are in the same space as the SVG
const viewBox = computed(() => {
    // Ideally this would match the canvas size, but 0 0 10000 10000 is a safe bet for many scenes
    // if the SVG is absolutely positioned over the canvas.
    return undefined; // Let it use default coordinate system if it's 1:1 with canvas pixels
});

const getLineCoords = (line: AlignmentLine) => {
  if (line.type === 'vertical') {
    return { x1: line.pos, y1: line.start, x2: line.pos, y2: line.end };
  }
  return { x1: line.start, y1: line.pos, x2: line.end, y2: line.pos };
};

const getMeasurementCoords = (item: MeasurementLine) => {
  if (item.type === 'vertical') {
    return { x1: item.pos, y1: item.start, x2: item.pos, y2: item.end };
  }
  return { x1: item.start, y1: item.pos, x2: item.end, y2: item.pos };
};

const getExtensionCoords = (item: MeasurementLine, pos: 'start' | 'end') => {
    const coord = pos === 'start' ? item.start : item.end;
    const range = pos === 'start' ? item.startExtend : item.endExtend;
    if (!range) return { x1: 0, y1: 0, x2: 0, y2: 0 };

    if (item.type === 'horizontal') {
        return { x1: coord, y1: range.s, x2: coord, y2: range.e };
    } else {
        return { x1: range.s, y1: coord, x2: range.e, y2: coord };
    }
};

const getMarkerTransform = (item: MeasurementLine, pos: 'start' | 'end') => {
  const val = pos === 'start' ? item.start : item.end;
  const s = 1 / scale.value;
  if (item.type === 'vertical') {
    return `translate(${item.pos}, ${val}) scale(${s})`;
  }
  return `translate(${val}, ${item.pos}) scale(${s})`;
};

const getLabelPos = (item: MeasurementLine) => {
  const mid = (item.start + item.end) / 2;
  if (item.type === 'vertical') {
    return { x: item.pos, y: mid };
  }
  return { x: mid, y: item.pos };
};
</script>

<style lang="scss" scoped>
.editor-guide-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: visible;

  .guide-line {
    stroke: #ff4d4f;
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
    opacity: 0.6;

    &.dashed {
      stroke-dasharray: 5 4;
      opacity: 0.7;
    }

    &.solid {
      stroke-width: 1.5px;
      opacity: 0.8;
    }

    &.extension-dashed {
      stroke-dasharray: 3 3;
      opacity: 0.4;
    }
  }

  .x-marker {
    path {
      stroke: #ff4d4f;
      stroke-width: 1.5px;
      fill: none;
      vector-effect: non-scaling-stroke;
      opacity: 0.7;
    }
  }

  .label-container {
    overflow: visible;
    pointer-events: none;
  }

  .label-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .measurement-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 77, 79, 0.9);
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 0 4px;
    height: 16px;
    border-radius: 2px;
    white-space: nowrap;
    transform: translateY(-1.5px) scale(calc(1 / var(--scale, 1)));
    transform-origin: center;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
}
</style>
