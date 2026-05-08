import { defineConfig } from '@adobe/aio-commerce-lib-app/config';

export default defineConfig({
    metadata: {
        id: 'my-application',
        displayName: 'My Application',
        version: '1.0.0',
        description: 'A custom Adobe Commerce application. Fill description for your app.',
    },
    businessConfig: {
        schema: [
            {
                type: 'list',
                name: 'sampleList',
                label: 'Sample List',
                selectionMode: 'multiple',
                default: ['a'],
                options: [
                    { label: 'Option A', value: 'a' },
                    { label: 'Option B', value: 'b' },
                ],
            },
            {
                type: 'text',
                name: 'sampleText',
                label: 'Sample Text',
                default: 'Hello, world!',
            },
        ],
    },
});
