import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'pages') {
    return {
      build: {
        outDir: 'dist-pages'
      }
    }
  }

  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'ParaKnob',
        fileName: 'paraknob',
        formats: ['es']
      }
    }
  }
})
