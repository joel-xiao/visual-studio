import { Ref, onMounted, onBeforeUnmount, readonly, markRaw } from 'vue';

const onWheel = function (e: WheelEvent): void {
  e.preventDefault();
  // const { isCtrl } = getBindKeys();
  // if (isCtrl) {
  //   let ratio = 1.1;
  //   if (e.deltaY > 0) {
  //     ratio = 0.9;
  //   }
  //   scale = scale * ratio;
  //   const ratio_scale = ratio - 1;
  //   const origin = {
  //     x: ratio_scale * root.width * 0.5,
  //     y: ratio_scale * root.height * 0.5
  //   };
  //   let { x, y } = getMiddleScaleOffset();
  //   x -= ratio_scale * (e.clientX - x - (window.innerWidth - root.width) * 0.5) - origin.x;
  //   y -= ratio_scale * (e.clientY - y - (window.innerHeight - root.height) * 0.5) - origin.y;
  //   setMiddleScaleOffset({ x, y });
  //   // setMiddleScale(scale);
  //   if (containerEl.value) {
  //     containerEl.value.style.scale = `${scale}`;
  //   }
  // }
};
const addWheelEvent = (el: Element) => {
  el.addEventListener('mousewheel', onWheel);
};
export const useMiddle = function () {
  return readonly(
    markRaw({
      addWheelEvent
    })
  );
};
