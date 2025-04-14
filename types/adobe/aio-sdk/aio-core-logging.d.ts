import Logger, { AioLoggerConfig } from '@adobe/aio-lib-core-logging';
declare module '@adobe/aio-sdk' {
    export namespace Core {
        export { Logger, AioLoggerConfig };
    }
}
