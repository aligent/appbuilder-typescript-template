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

interface SuccessResponse<B> {
    statusCode: number;
    body: B;
}

interface ErrorResponse {
    error: {
        statusCode: number;
        body: {
            error: string;
        };
    };
}

export type ActionBaseParams = RequestParameters & {
    LOG_LEVEL?: Core.LogLevel;
};

export type Response<B> = Promise<SuccessResponse<B> | ErrorResponse>;
