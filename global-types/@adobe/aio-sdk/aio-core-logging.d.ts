import Logger, { AioLoggerConfig } from '@adobe/aio-lib-core-logging';

/**
 * In the official `AioLoggerConfig` type, `level` is defined as `string`, but the values accepted are:
 * 'error', 'warn', 'info', 'verbose', 'debug', and 'silly'. See [Adobe Developer
 * Doc](https://developer.adobe.com/commerce/extensibility/app-development/best-practices/logging-troubleshooting/#set-the-log-level)
 * for reference.
 */
type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

declare module '@adobe/aio-sdk' {
    export namespace Core {
        export { Logger, AioLoggerConfig, LogLevel };
    }
}
