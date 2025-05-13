declare module '@adobe/aio-sdk' {
    export * as Files from '@adobe/aio-lib-files';

    export namespace Files {
        export type UrlType = {
            internal: 'internal';
            external: 'external';
        };
    }
}
