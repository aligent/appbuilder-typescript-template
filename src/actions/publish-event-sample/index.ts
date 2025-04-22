/**
 * This is a sample action showcasing how to create a cloud event and publish to I/O Events
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */

import { Core, Events } from '@adobe/aio-sdk';
import { CloudEvent } from 'cloudevents';
import { v4 as uuid } from 'uuid';
import { STATUS_CODES, StatusCode } from '../utils/http.js';
import { RequestParameters } from '../utils/runtime.js';
import {
    checkMissingRequestInputs,
    errorResponse,
    getBearerToken as extractBearerToken,
    stringParameters,
} from '../utils/utils.js';

type Params = RequestParameters & {
    LOG_LEVEL?: string;
    apiKey?: string;
    providerId?: string;
    eventCode?: string;
    payload?: unknown;
};

// Runtime actions MUST export an async main function
export async function main(params: Readonly<Params>) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

    try {
        logger.info('Calling the main action');
        logger.debug(stringParameters(params));

        // Validate the input parameters, fail without retrying if any are missing
        const { success, data, error } = checkMissingRequestInputs(
            params,
            ['apiKey', 'providerId', 'eventCode', 'payload'],
            ['authorization', 'x-gw-ims-org-id']
        );

        if (!success) {
            return errorResponse(STATUS_CODES.BadRequest, error, logger);
        }

        // extract the user Bearer token from the Authorization header
        const token = extractBearerToken(data);
        if (!token) {
            return errorResponse(401, 'missing Authorization header', logger);
        }

        // We're confident we have an orgId because we checked for it in checkMissingRequestInputs
        const orgId = data.__ow_headers['x-gw-ims-org-id'];
        const eventsClient = await Events.init(orgId, data.apiKey, token);

        // Create cloud event and publish to I/O Events
        const cloudEvent = createCloudEvent(data.providerId, data.eventCode, data.payload);
        const published = await eventsClient.publishEvent(cloudEvent);
        let statusCode: StatusCode = STATUS_CODES.OK;
        if (published === 'OK') {
            logger.info('Published successfully to I/O Events');
        } else if (published === undefined) {
            logger.info('Published to I/O Events but there were not interested registrations');
            statusCode = STATUS_CODES.NoContent;
        }
        const response = {
            statusCode: statusCode,
        };

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

function createCloudEvent(providerId: string, eventCode: string, payload: unknown) {
    const cloudevent = new CloudEvent({
        source: 'urn:uuid:' + providerId,
        type: eventCode,
        datacontenttype: 'application/json',
        data: payload,
        id: uuid(),
    });
    return cloudevent;
}
