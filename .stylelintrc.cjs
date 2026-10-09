/** @type {import('stylelint').Config} */
module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
  customSyntax: 'postcss-html',
  ignoreFiles: ['node_modules/**', 'dist/**', 'coverage/**'],
  rules: {
    // UnoCSS @apply / @screen etc.
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['apply', 'screen', 'variants', 'responsive', 'unocss'] },
    ],
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'property-no-vendor-prefix': null,
    'no-empty-source': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'scss/dollar-variable-pattern': null,
    'no-duplicate-selectors': null,
  },
}
