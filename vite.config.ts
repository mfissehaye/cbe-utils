import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CBEUtils',
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
      formats: ['es', 'cjs']
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [
        'axios',
        'pdf-text-reader',
        'dayjs',
        'node:https',
        'node:path',
        'https',
        'path'
      ],
      output: {
        exports: 'named'
      }
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/**/*.test.ts',
        'test/**/*.spec.ts',
        'dist/',
        'coverage/'
      ]
    }
  }
}) 