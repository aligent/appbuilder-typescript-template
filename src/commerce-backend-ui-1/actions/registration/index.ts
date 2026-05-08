/**
 * Extension Registration Component
 *
 * @returns {Promise<{statusCode: number, body: object}>} The HTTP response with status code and body
 */
export function main() {
    const extensionId = 'sample';

    return {
        statusCode: 200,
        body: {
            registration: {
                menuItems: [
                    {
                        id: `${extensionId}::app`,
                        title: 'Sample App',
                        parent: `${extensionId}::apps`,
                        sortOrder: 1,
                    },
                    {
                        id: `${extensionId}::apps`,
                        title: 'Apps',
                        isSection: true,
                        sortOrder: 100,
                    },
                ],
                page: {
                    title: 'Sample App',
                },
            },
        },
    };
}
