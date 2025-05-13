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

import { Core, Files } from '@adobe/aio-sdk';

import { STATUS_CODES } from '../utils/http.ts';
import { RequestParameters } from '../utils/runtime.ts';
import { getLogURL } from '../utils/system-log.ts';
import { checkMissingRequestInputs, errorResponse, stringParameters } from '../utils/utils.ts';

type Params = RequestParameters & {
    LOG_LEVEL?: string;
    EXECUTION_LOG_PATH?: string;
};

// Runtime actions MUST export an async main function
export async function main(params: Params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
    try {
        logger.info('Calling the main action');
        logger.debug(stringParameters(params));

        // Validate the input parameters, fail without retrying if any are missing
        const requiredParams = ['EXECUTION_LOG_PATH'];
        const { success, data, error } = checkMissingRequestInputs(params, requiredParams, []);
        if (!success) {
            return errorResponse(STATUS_CODES.BadRequest, error, logger);
        }

        const files = await Files.init();
        const url = await getLogURL(files, `${data.EXECUTION_LOG_PATH}/execution_log.txt`);

        logger.info(`${url}: successful request`);
        return {
            statusCode: STATUS_CODES.OK,
            body: { url },
        };
    } catch (error) {
        if (typeof error === 'string' || (typeof error === 'object' && error !== null)) {
            logger.error(error);
        }
        // Will cause the action to be retried for 24 hours with exponential backoff
        // https://developer.adobe.com/events/docs/support/faq/#what-happens-if-my-webhook-is-down-why-is-my-event-registration-marked-as-unstable
        return errorResponse(STATUS_CODES.InternalServerError, 'server error', logger);
    }
}
