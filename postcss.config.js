/**
 * @module postcss
 * @author: Joel
 * @description: CSS Style 手机适配
 */
module.exports = {
  plugins: {
    autoprefixer: {},
    // 将单位转换为rem
    'postcss-pxtorem': {
      // rootValue: 37.5, // 值：设计图宽度/20  （目标是将屏幕转化为20rem）
      // propList: ['*'],
      // // 该项仅在使用 Circle 组件时需要
      // // van-circle__layer 原因参见 https://github.com/youzan/vant/issues/1948
      // selectorBlackList: ['van-circle__layer', '.norem'], // 过滤掉.norem-开头的class，不进行rem转换
    }
  }
};
