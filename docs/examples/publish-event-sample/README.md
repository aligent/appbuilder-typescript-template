# Publish Event Sample Action

This example demonstrates how to create a cloud event and publish it to Adobe I/O Events using the Events SDK.

## Action Code

Create `src/actions/publish-event-sample/index.ts`:

```typescript
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

import { STATUS_CODES, StatusCode } from '@/actions/utils/http.ts';
import { ActionBaseParams } from '@/actions/utils/runtime.ts';
import {
    checkMissingRequestInputs,
    errorResponse,
    getBearerToken as extractBearerToken,
    stringParameters,
} from '@/actions/utils/utils.ts';

type Params = ActionBaseParams & {
    apiKey?: string;
    providerId?: string;
    eventCode?: string;
    payload?: unknown;
};

// Runtime actions MUST export an async main function
export async function main(params: Readonly<Params>) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

    try {
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

        // initialise the cloud events client with provided auth and org details
        const token = extractBearerToken(data);
        if (!token) {
            return errorResponse(401, 'missing Authorization header', logger);
        }
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
```

## app.config.yaml

Add the action definition under `runtimeManifest.packages.<package>.actions`:

```yaml
publish-event-sample:
  function: src/actions/publish-event-sample/index.ts
  web: 'yes'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
    apiKey: $SERVICE_API_KEY
  annotations:
    require-adobe-auth: true
    final: true
```

## Unit Test

Create `tests/unit/publish-event-sample.test.ts`:

```typescript
import { Core, Events } from '@adobe/aio-sdk';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import * as action from '@/actions/publish-event-sample/index.ts';

// Create mock functions for the logger methods we want to spy on
const mockInfo = jest.fn();
const mockDebug = jest.fn();
const mockError = jest.fn();
const mockPublish = jest.fn<() => Promise<string | undefined>>();

// Mock the entire @adobe/aio-sdk module
jest.mock('@adobe/aio-sdk', () => {
    return {
        Core: {
            Logger: () => ({
                info: mockInfo,
                debug: mockDebug,
                error: mockError,
                // Add other methods if needed
            }),
        },
        Events: {
            init: () => ({
                publishEvent: mockPublish,
            }),
        },
    };
});

const loggerSpy = jest.spyOn(Core, 'Logger');
const initSpy = jest.spyOn(Events, 'init');

beforeEach(() => {
    jest.clearAllMocks();
});

const fakeParams = {
    __ow_headers: { authorization: 'Bearer fakeToken', 'x-gw-ims-org-id': 'fakeOrgId' },
    __ow_method: 'POST',
    __ow_path: '/',
    __ow_body: '',
    __ow_query: '',
    apiKey: 'fakeKey',
    providerId: 'fakeProvider',
    eventCode: 'fakeEventCode',
    payload: { hello: 'world' },
};

describe('publish-event-sample', () => {
    test('main should be defined', () => {
        expect(action.main).toBeInstanceOf(Function);
    });
    test('should set logger to use LOG_LEVEL param when it is provided', async () => {
        await action.main({ ...fakeParams, LOG_LEVEL: 'debug' });
        expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), { level: 'debug' });
    });
    test('events sdk should be initialized with input credentials', async () => {
        await action.main(fakeParams);
        expect(initSpy).toHaveBeenCalledWith('fakeOrgId', 'fakeKey', 'fakeToken');
    });
    test('should return an http response with 200 status code if successful', async () => {
        mockPublish.mockResolvedValue('OK');
        const response = await action.main(fakeParams);
        expect(response).toEqual(
            expect.objectContaining({
                statusCode: 200,
            })
        );
    });
    test('should return an http response with 204 status code if successful', async () => {
        mockPublish.mockResolvedValue(undefined);
        const response = await action.main(fakeParams);
        expect(response).toEqual(
            expect.objectContaining({
                statusCode: 204,
            })
        );
    });
    test('if there is an error should return a 500 and log the error', async () => {
        const fakeError = new Error('fake');
        mockPublish.mockRejectedValue(fakeError);
        const response = await action.main(fakeParams);
        expect(response).toEqual(
            expect.objectContaining({
                error: {
                    statusCode: 500,
                    body: { error: 'server error' },
                },
            })
        );
        expect(mockError).toHaveBeenCalledWith(fakeError);
    });
    test('missing input request parameters, should return 400', async () => {
        const { __ow_headers, apiKey, providerId, eventCode, payload, ...params } = fakeParams;
        const response = await action.main({ ...params, __ow_headers: {} });
        expect(response).toEqual({
            error: {
                statusCode: 400,
                body: {
                    error: "missing header(s) 'authorization,x-gw-ims-org-id' and missing parameter(s) 'apiKey,providerId,eventCode,payload'",
                },
            },
        });
    });
});
```

## E2E Test

Create `tests/e2e/publish-event-sample.e2e.test.ts`:

```typescript
import { Core } from '@adobe/aio-sdk';
import { expect, test } from '@jest/globals';

// get action url
const namespace = Core.Config.get('runtime.namespace');
const hostname = Core.Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'appbuilder';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/publish-event-sample`;

// The deployed actions are secured with the `require-adobe-auth` annotation.
// If the authorization header is missing, Adobe I/O Runtime returns with a 401 before the action is executed.
test('returns a 401 when missing Authorization header', async () => {
    const res = await fetch(actionUrl);
    expect(res).toEqual(
        expect.objectContaining({
            status: 401,
        })
    );
});
```
