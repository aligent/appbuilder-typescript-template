/* This file exposes some common utilities for your actions */

import type { Paths, SetRequiredDeep, SimplifyDeep, UnionToIntersection } from 'type-fest';
import { RequestParameters } from './runtime.ts';

/**
 *
 * Returns a log ready string of the action input parameters.
 * The `Authorization` header content will be replaced by '<hidden>'.
 *
 * @param {object} params action input parameters.
 *
 * @returns {string} A sanitized string containing the input parameters
 *
 */
export function stringParameters<T extends RequestParameters>(params: T): string {
    // hide authorization token without overriding params
    let headers = params.__ow_headers || {};
    if (headers.authorization) {
        headers = { ...headers, authorization: '<hidden>' };
    }
    return JSON.stringify({ ...params, __ow_headers: headers });
}

/**
 * Type guard to check if a value is a classic object (i.e. indexable by string keys).
 *
 * @param {unknown} value value to check.
 * @returns {boolean} true if the value is an object, false otherwise.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && value.constructor === Object;
}

/**
 * Safely retrieves a value from an object using a dot-notation path.
 * Returns undefined if the full path does not exist.
 *
 * @param {Record<string, unknown>} obj object to check.
 * @param {string} path dot-notation path to the value.
 * @returns {unknown} the value at the path or undefined if the path does not exist.
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let currentValue: unknown = obj;

    for (const key of keys) {
        if (!isRecord(currentValue)) {
            return undefined;
        }
        currentValue = currentValue[key];
    }

    return currentValue;
}

/**
 * Returns the list of missing keys from an object based on required paths.
 * A key is missing if its value at the specified path is undefined or ''.
 *
 * @param {Record<string, unknown>} obj object to check.
 * @param {string[]} required list of required keys (can use dot notation for nesting).
 * @returns {string[]} Array of missing keys.
 */
function getMissingKeys(obj: Record<string, unknown>, required: string[]): string[] {
    return required.filter(requiredPath => {
        const value = getValueByPath(obj, requiredPath);
        return value === undefined || value === '';
    });
}

type BuildObject<P extends string> = P extends `${infer U}.${infer Rest}`
    ? { [key in U]: BuildObject<Rest> }
    : { [key in P]: unknown };

export type ObjectFromPaths<P extends string[]> = SimplifyDeep<
    UnionToIntersection<BuildObject<P[number]>>
>;

/**
 *
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A value of 0 or null is not considered as missing.
 *
 * @param {object} params action input parameters.
 * @param {array} requiredHeaders list of required input headers.
 * @param {array} requiredParams list of required input parameters.
 *        Each element can be multi level deep using a '.' separator e.g. 'myRequiredObj.myRequiredKey'.
 *
 * @returns {object} Returns an object with the following properties:
 *        - success: boolean
 *        - data: The input parameters with the required keys set
 *        - error: A string describing the missing inputs if any
 *
 */
export function checkMissingRequestInputs<
    const T extends Partial<RequestParameters>,
    const P extends Array<Paths<T> | Paths<T>>,
    const H extends Array<Paths<T> | Paths<T['__ow_headers']>>,
>(params: T, requiredParams: P, requiredHeaders: H) {
    let errorMessage: string | null = null;

    // check for missing headers, including those added by OpenWhisk
    const missingHeaders = getMissingKeys({ ...params.__ow_headers }, requiredHeaders);
    if (missingHeaders.length > 0) {
        errorMessage = `missing header(s) '${missingHeaders}'`;
    }

    // check for missing parameters
    const missingParams = getMissingKeys(params, requiredParams);
    if (missingParams.length > 0) {
        if (errorMessage) {
            errorMessage += ' and ';
        } else {
            errorMessage = '';
        }
        errorMessage += `missing parameter(s) '${missingParams}'`;
    }

    if (errorMessage) {
        return {
            success: false as const,
            error: errorMessage,
        };
    }

    return {
        success: true as const,
        data: params as SetRequiredDeep<T, [...P][number]> & {
            __ow_headers: {
                [key in H[number]]: string;
            };
        },
    };
}

/**
 *
 * Extracts the bearer token string from the Authorization header in the request parameters.
 *
 * @param {object} params action input parameters.
 *
 * @returns {string|undefined} the token string or undefined if not set in request headers.
 *
 */
export function getBearerToken<T extends Pick<RequestParameters, '__ow_headers'>>(
    params: T
): string | undefined {
    const bearerPrefix = 'Bearer ';
    if (
        typeof params.__ow_headers?.authorization === 'string' &&
        params.__ow_headers.authorization.startsWith(bearerPrefix)
    ) {
        return params.__ow_headers.authorization.substring(bearerPrefix.length);
    }
    return undefined;
}

/**
 *
 * Returns an error response object and attempts to log.info the status code and error message
 *
 * @param {number} statusCode the error status code.
 *        e.g. 400
 * @param {string} message the error message.
 *        e.g. 'missing xyz parameter'
 * @param {*} [logger] an optional logger instance object with an `info` method
 *        e.g. `new require('@adobe/aio-sdk').Core.Logger('name')`
 *
 * @returns {object} the error object, ready to be returned from the action main's function.
 *
 */
export function errorResponse(
    statusCode: number,
    message: string,
    logger?: { info: (message: string) => unknown }
): object {
    logger?.info(`${statusCode}: ${message}`);

    return {
        error: {
            statusCode,
            body: {
                error: message,
            },
        },
    };
}
