# API Sample Action

This example demonstrates how to create an action that calls an external API, validates input parameters, and returns the response.

## Action Code

Create `src/actions/api-sample/index.ts`:

```typescript
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

import { Core } from '@adobe/aio-sdk';

import { STATUS_CODES } from '@/actions/utils/http.ts';
import { ActionBaseParams } from '@/actions/utils/runtime.ts';
import {
    checkMissingRequestInputs,
    errorResponse,
    stringParameters,
} from '@/actions/utils/utils.ts';

type Params = ActionBaseParams & { BASE_URL?: string; name?: string };

// Runtime actions MUST export an async main function
export async function main(params: Params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

    try {
        logger.debug(stringParameters(params));

        // Validate the input parameters, fail without retrying if any are missing
        const requiredParams = ['name', 'BASE_URL'];
        const { success, data, error } = checkMissingRequestInputs(params, requiredParams, []);
        if (!success) {
            return errorResponse(STATUS_CODES.BadRequest, error, logger);
        }

        // Fetch, parse and return the response from the external API
        const apiEndpoint = data.BASE_URL + data.name;
        const res = await fetch(apiEndpoint);
        if (!res.ok) {
            throw new Error('request to ' + apiEndpoint + ' failed with status code ' + res.status);
        }
        const content = await res.json();
        const response = {
            statusCode: STATUS_CODES.OK,
            body: content,
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
```

## app.config.yaml

Add the action definition under `runtimeManifest.packages.<package>.actions`:

```yaml
api-sample:
  function: src/actions/api-sample/index.ts
  web: 'yes'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
    BASE_URL: $BASE_URL
  annotations:
    require-adobe-auth: true
    final: true
```

Add `BASE_URL` to your `.env` file:

```bash
BASE_URL=https://pokeapi.co/api/v2/pokemon/
```

## Unit Test

Create `tests/unit/api-sample.test.ts`:

```typescript
import { Core } from '@adobe/aio-sdk';
import { afterAll, afterEach, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import * as action from '@/actions/api-sample/index.ts';

// Create mock functions for the logger methods we want to spy on
const mockInfo = jest.fn();
const mockDebug = jest.fn();
const mockError = jest.fn();
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
    };
});

const loggerSpy = jest.spyOn(Core, 'Logger');

// Mock an external API for testing fetch requests
// IMPORTANT: If a request is made that doesn't have a matching handler,
// it will cause a timeout. That's why the base handler is '*'.
export const handlers = [
    http.get('http://fake-url.com/get/*', () => {
        return HttpResponse.json({ content: 'fake' });
    }),
    http.get('*', () => {
        return HttpResponse.json(null, { status: 404 });
    }),
];
const server = setupServer(...handlers);

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

const fakeParams = {
    __ow_headers: {},
    __ow_method: 'GET',
    __ow_path: '/',
    __ow_body: '',
    __ow_query: '',
    name: 'fake',
    BASE_URL: 'http://fake-url.com/get/',
};

describe('api-sample', () => {
    test('main should be defined', () => {
        expect(action.main).toBeInstanceOf(Function);
    });
    test('should set logger to use LOG_LEVEL param when it is provided', async () => {
        await action.main({ ...fakeParams, LOG_LEVEL: 'debug' });
        expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), { level: 'debug' });
    });
    test('should return an http reponse with the fetched content', async () => {
        const response = await action.main(fakeParams);
        expect(response).toEqual({
            statusCode: 200,
            body: { content: 'fake' },
        });
    });
    test('if there is an error should return a 500 and log the error', async () => {
        server.use(
            http.get('http://fake-url.com/get/*', () => {
                throw new Error();
            })
        );

        const response = await action.main(fakeParams);
        expect(response).toEqual({
            error: {
                statusCode: 500,
                body: { error: 'server error' },
            },
        });
        expect(mockError).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('500') })
        );
    });
    test('if returned service status code is not ok should return a 500 and log the status', async () => {
        server.use(
            http.get('http://fake-url.com/get/*', () => {
                return HttpResponse.json(null, { status: 404 });
            })
        );

        const response = await action.main(fakeParams);
        expect(response).toEqual({
            error: {
                statusCode: 500,
                body: { error: 'server error' },
            },
        });
        // error message should contain 404
        expect(mockError).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('404') })
        );
    });
    test('missing input request parameters, should return 400', async () => {
        const { name, BASE_URL, ...params } = fakeParams;
        const response = await action.main(params);
        expect(response).toEqual({
            error: {
                statusCode: 400,
                body: { error: "missing parameter(s) 'name,BASE_URL'" },
            },
        });
    });
});
```

## E2E Test

Create `tests/e2e/api-sample.e2e.test.ts`:

```typescript
import { Core } from '@adobe/aio-sdk';
import { expect, test } from '@jest/globals';

// get action url
const namespace = Core.Config.get('runtime.namespace');
const hostname = Core.Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'appbuilder';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/api-sample`;

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
