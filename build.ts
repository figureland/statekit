import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: [
    './src/index.ts',
    './src/svelte.ts',
    './src/react.ts',
    './src/vue.ts',
    './src/typed-local-storage.ts'
  ],
  outdir: './dist',
  minify: false,
  plugins: [dts()],
  external: ['svelte', 'react', 'vue', 'superjson']
})
