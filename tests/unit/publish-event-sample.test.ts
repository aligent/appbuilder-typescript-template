import { Core, Events } from '@adobe/aio-sdk';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as action from '../../src/actions/publish-event-sample/index.ts';

// Create mock functions for the logger methods we want to spy on
const mockInfo = vi.fn();
const mockDebug = vi.fn();
const mockError = vi.fn();
const mockPublish = vi.fn<() => Promise<string | undefined>>();

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
        Events: {
            init: () => ({
                publishEvent: mockPublish,
            }),
        },
    };
});

const loggerSpy = vi.spyOn(Core, 'Logger');
const initSpy = vi.spyOn(Events, 'init');

beforeEach(() => {
    vi.clearAllMocks();
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
    LOG_LEVEL: 'fakeLevel',
};

describe('publish-event-sample', () => {
    test('main should be defined', () => {
        expect(action.main).toBeInstanceOf(Function);
    });
    test('should set logger to use LOG_LEVEL param', async () => {
        await action.main(fakeParams);
        expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), { level: 'fakeLevel' });
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
