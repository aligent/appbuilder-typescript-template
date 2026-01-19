import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        globals: true,
        watch: false,
        environment: 'node',
        reporters: ['default'],
        coverage: {
            provider: 'v8',
            exclude: ['node_modules/', '**/types', '*.{js,mjs}'],
            thresholds: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
        },
        include: [
            'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        ],
    },
});
