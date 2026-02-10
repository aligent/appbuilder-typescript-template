import { Core } from '@adobe/aio-sdk';

/**
 * Request parameters set by the OpenWhisk framework.
 * https://developer.adobe.com/runtime/docs/guides/reference/environment_variables/
 */
export interface RequestParameters {
    __ow_method: string;
    __ow_headers: {
        authorization?: string;
        [key: string]: string | number | undefined;
    };
    __ow_path: string;
    __ow_body: string;
    __ow_query: string;
    [key: string]: unknown;
}

/**
 * Environment variables set by the OpenWhisk framework.
 * https://developer.adobe.com/runtime/docs/guides/reference/environment_variables/
 */
export interface EnvironmentVariables {
    __OW_ACTION_NAME: string;
    __OW_ACTION_VERSION: string;
    __OW_ACTIVATION_ID: string;
    __OW_ALLOW_CONCURRENT: string;
    __OW_API_HOST: string;
    __OW_CLOUD: string;
    __OW_NAMESPACE: string;
    __OW_REGION: string;
    __OW_TRANSACTION_ID: string;
}

export interface SuccessResponse<B> {
    statusCode: number;
    body: B;
}

export interface ErrorResponse {
    error: {
        statusCode: number;
        body: {
            error: string;
        };
    };
}

/** Union of success/error responses returned by an action. */
export type ActionResponse<B> = SuccessResponse<B> | ErrorResponse;

// --- Non-instrumented actions ---

export type ActionBaseParams = RequestParameters & {
    LOG_LEVEL?: Core.LogLevel;
};

export type Response<B> = Promise<ActionResponse<B>>;

// --- Instrumented actions ---

/**
 * Params type for instrumented action entrypoints.
 *
 * `instrumentEntrypoint` requires `(params: Record<string, unknown>) => any`,
 * so instrumented actions cannot use the stricter {@link ActionBaseParams} in
 * their function signature. Use type assertions within the function body to
 * access specific params:
 *
 * @example
 * ```ts
 * function main(params: InstrumentedActionParams) {
 *     const message = params.message as string;
 *     const iterations = (params.iterations as number) ?? 5;
 * }
 *
 * const instrumented = instrumentEntrypoint(main, telemetryConfig);
 * export { instrumented as main };
 * ```
 */
export type InstrumentedActionParams = Record<string, unknown>;
