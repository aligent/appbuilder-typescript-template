/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */

import { Core, State } from '@adobe/aio-sdk';

import { STATUS_CODES } from '../utils/http.ts';
import { RequestParameters } from '../utils/runtime.ts';
import { checkMissingRequestInputs, errorResponse, stringParameters } from '../utils/utils.ts';

type Params = RequestParameters & {
    LOG_LEVEL?: string;
    BASE_URL?: string;
    name?: string;
};

// Runtime actions MUST export an async main function
export async function main(params: Params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
    try {
        logger.info('Calling the main action');
        logger.debug(stringParameters(params));

        // Validate the input parameters, fail without retrying if any are missing
        const requiredParams = ['name', 'BASE_URL'];
        const { success, data, error } = checkMissingRequestInputs(params, requiredParams, []);
        if (!success) {
            return errorResponse(STATUS_CODES.BadRequest, error, logger);
        }

        const state = await State.init();
        const cached = await state.get(data.name).catch(() => {
            logger.warn('Error getting cached data for ' + data.name);
            return null;
        });

        if (cached) {
            logger.info('Cached data: ' + cached.value);
            return {
                statusCode: STATUS_CODES.OK,
                body: { ...JSON.parse(cached.value), cached: true },
            };
        }

        // Fetch, parse and return the response from the external API
        const apiEndpoint = data.BASE_URL + data.name;
        const res = await fetch(apiEndpoint);
        if (!res.ok) {
            throw new Error('request to ' + apiEndpoint + ' failed with status code ' + res.status);
        }
        const { name, id, height, is_default } = (await res.json()) as {
            name: string;
            id: number;
            height: number;
            is_default: boolean;
        };
        const response = {
            statusCode: STATUS_CODES.OK,
            body: { name, id, height, is_default, cached: false },
        };

        await state.put(name, JSON.stringify({ name, id, height, is_default }));

        logger.info(`${response.statusCode}: successful request`);
        return response;
    } catch (error) {
        if (typeof error === 'string' || (typeof error === 'object' && error !== null)) {
            logger.error(error);
        }
        // Will cause the action to be retried for 24 hours with exponential backoff
        // https://developer.adobe.com/events/docs/support/faq/#what-happens-if-my-webhook-is-down-why-is-my-event-registration-marked-as-unstable
        return errorResponse(STATUS_CODES.InternalServerError, 'server error', logger);
    }
}
