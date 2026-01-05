import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        'index': 'src/index.ts',
        'schema': 'src/schema/index.ts',
        'rhf': 'src/adapters/rhf.ts',
        'zod': 'src/resolvers/zod.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['react', 'react-hook-form', 'zod'],
})