const { spawn } = require('child_process')
const colors = require('kleur')
const { performance } = require('perf_hooks')
const sveltePreprocess = require('svelte-preprocess')
const postcss = require('./postcss.config')

const createPreprocessors = ({ sourceMap }) => [
  sveltePreprocess({
    sourceMap,
    defaults: {
      script: 'typescript',
      style: 'postcss'
    },

    postcss
  })
]

// Changes in these files will trigger a rebuild of the global CSS
const globalCSSWatchFiles = ['postcss.config.js', 'src/global.pcss']

module.exports = {
  createPreprocessors,
  // for `svelte-check` and svelte VS Code extension
  preprocess: createPreprocessors({ sourceMap: true }),

  buildCss: ({ dev, sourcemap }) => {
    let builder
    let rebuildNeeded = false

    const buildGlobalCSS = () => {
      if (builder) {
        rebuildNeeded = true
        return
      }
      rebuildNeeded = false
      const start = performance.now()

      try {
        builder = spawn('node', [
          '--experimental-modules',
          '--unhandled-rejections=strict',
          'build-global-css.mjs',
          sourcemap
        ])
        builder.stdout.pipe(process.stdout)
        builder.stderr.pipe(process.stderr)

        builder.on('close', (code) => {
          if (code === 0) {
            const elapsed = parseInt(performance.now() - start, 10)
            console.log(
              `${colors.green(
                '✔ global css'
              )} (src/global.pcss → static/global.css${
                sourcemap === true ? ' + static/global.css.map' : ''
              }) ${colors.gray(`(${elapsed}ms)`)}`
            )
          } else if (code !== null) {
            if (dev) {
              console.error(`global css builder exited with code ${code}`)
              console.log(colors.bold().red('✗ global css'))
            } else {
              throw new Error(`global css builder exited with code ${code}`)
            }
          }

          builder = undefined

          if (rebuildNeeded) {
            console.log(
              `\n${colors
                .bold()
                .italic()
                .cyan('something')} changed. rebuilding...`
            )
            buildGlobalCSS()
          }
        })
      } catch (err) {
        console.log(colors.bold().red('✗ global css'))
        console.error(err)
      }
    }

    return {
      name: 'build-global-css',
      buildStart() {
        buildGlobalCSS()
        globalCSSWatchFiles.forEach((file) => this.addWatchFile(file))
      },
      generateBundle: buildGlobalCSS
    }
  }
}
