import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        pool: 'forks',
        include: ['src/tests/**/*.test.ts'],
        testTimeout: 30_000,
        hookTimeout: 30_000,
        teardownTimeout: 30_000,
        /* Los tests de integración corren en un único worker secuencial */
        fileParallelism: false,
    },
});
