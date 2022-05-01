/**
 * @module .stylelintrc
 * @author: Joel
 * @description: css校验配置
 */
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier',
    'stylelint-config-recommended-vue/scss',
    'stylelint-config-recess-order'
  ],
  rules: {
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    'declaration-block-trailing-semicolon': null,
    'declaration-block-semicolon-space-before': 'never',
    'media-feature-name-no-unknown': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep']
      }
    ],
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested']
      }
    ],
    'font-family-no-missing-generic-family-keyword': null,
    // style calc中使用v-bind
    'function-calc-no-unspaced-operator': null,
    'scss/double-slash-comment-whitespace-inside': null,
    // hsla(0, 0%, 100%, 0) to hsla(0deg, 0%, 100%, 0)
    'hue-degree-notation': null,
    // hsla(0, 0%, 100%, 0) to hsla(0, 0%, 100%, 0%)
    'alpha-value-notation': null,
    // hsla(0, 0%, 100%, 0) to hsla(0/ 0%/ 100%/ 0)
    'color-function-notation': null,
    // 隔行
    'custom-property-empty-line-before': null,
    'custom-property-empty-line-before': null,
    // class重复名称 例如 drag-resize 指令 src/directives/darg-resize/index.scss
    'no-descending-specificity': null
  }
};
