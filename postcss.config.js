const purgeCss = require('@fullhuman/postcss-purgecss')
const autoPrefixer = require('autoprefixer')
const cssnano = require('cssnano')
const postcssImport = require('postcss-import')

const mode = process.env.NODE_ENV
const dev = mode === 'development'

module.exports = {
  plugins: [
    postcssImport,
    autoPrefixer,

    !dev &&
      purgeCss({
        content: ['./src/**/*.svelte', './src/**/*.html'],
        keyframes: true
      }),
    !dev &&
      cssnano({
        preset: ['default', { discardComments: { removeAll: true } }]
      })
  ].filter(Boolean)
}
