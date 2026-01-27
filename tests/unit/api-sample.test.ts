import { Core } from '@adobe/aio-sdk';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import * as action from '../../src/actions/api-sample/index.js';

// Create mock functions for the logger methods we want to spy on
const mockInfo = vi.fn();
const mockDebug = vi.fn();
const mockError = vi.fn();
// Mock the entire @adobe/aio-sdk module
vi.mock('@adobe/aio-sdk', () => {
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

const loggerSpy = vi.spyOn(Core, 'Logger');

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
    vi.clearAllMocks();
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
    LOG_LEVEL: 'fakeLevel',
};

describe('api-sample', () => {
    test('main should be defined', () => {
        expect(action.main).toBeInstanceOf(Function);
    });
    test('should set logger to use LOG_LEVEL param', async () => {
        await action.main(fakeParams);
        expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), { level: 'fakeLevel' });
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
