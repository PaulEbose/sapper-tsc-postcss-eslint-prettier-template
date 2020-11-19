const production = process.env.NODE_ENV === 'production'

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-nested'),
    require('postcss-import'),

    production &&
      require('@fullhuman/postcss-purgecss')({
        content: ['./src/**/*.svelte', './src/**/*.html'],
        keyframes: true
      }),
    production &&
      require('cssnano')({
        preset: ['default', { discardComments: { removeAll: true } }]
      })
  ].filter(Boolean)
}
