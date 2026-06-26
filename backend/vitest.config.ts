import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        /*
         * Usa el pool 'forks' con tsx como loader de ESM para que los decoradores
         * de TypeORM (experimentalDecorators + emitDecoratorMetadata) funcionen
         * en los tests sin necesidad de compilar primero.
         */
        pool: 'forks',
        poolOptions: {
            forks: {
                execArgv: ['--import', 'tsx/esm'],
            },
        },
        include: ['src/tests/**/*.test.ts'],
        testTimeout: 30_000,
        hookTimeout: 30_000,
        teardownTimeout: 30_000,
        /* Los tests de integración corren en un único worker secuencial */
        fileParallelism: false,
    },
});
