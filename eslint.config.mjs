import { eslintConfigs } from '@aligent/ts-code-standards';

export default [
    ...eslintConfigs.react,
    {
        ignores: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/coverage'],
    },
];
