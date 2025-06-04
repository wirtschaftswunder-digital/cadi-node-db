import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: {
        entry: ['src/index.ts'],
        resolve: true,
    },
    clean: true,
    sourcemap: true,
    bundle: true,
    minify: true
})
