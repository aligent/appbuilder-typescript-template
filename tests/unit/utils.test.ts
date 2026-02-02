import { describe, expect, jest, test } from '@jest/globals';

import { RequestParameters } from '@/actions/utils/runtime.ts';
import * as utils from '@/actions/utils/utils.ts';

test('interface', () => {
    expect(typeof utils.errorResponse).toBe('function');
    expect(typeof utils.stringParameters).toBe('function');
    expect(typeof utils.checkMissingRequestInputs).toBe('function');
    expect(typeof utils.getBearerToken).toBe('function');
});

describe('errorResponse', () => {
    test('(400, errorMessage)', () => {
        const res = utils.errorResponse(400, 'errorMessage');
        expect(res).toEqual({
            error: {
                statusCode: 400,
                body: { error: 'errorMessage' },
            },
        });
    });

    test('(400, errorMessage, logger)', () => {
        const logger = {
            info: jest.fn(),
        };
        const res = utils.errorResponse(400, 'errorMessage', logger);
        expect(logger.info).toHaveBeenCalledWith('400: errorMessage');
        expect(res).toEqual({
            error: {
                statusCode: 400,
                body: { error: 'errorMessage' },
            },
        });
    });
});

describe('stringParameters', () => {
    test('no auth header', () => {
        const params = {
            a: 1,
            b: 2,
            __ow_headers: { 'x-api-key': 'fake-api-key' },
            __ow_method: 'GET',
            __ow_path: '/',
            __ow_body: '',
            __ow_query: '',
        };
        expect(utils.stringParameters(params)).toEqual(JSON.stringify(params));
    });
    test('with auth header', () => {
        const params = {
            a: 1,
            b: 2,
            __ow_headers: { 'x-api-key': 'fake-api-key', authorization: 'secret' },
            __ow_method: 'GET',
            __ow_path: '/',
            __ow_body: '',
            __ow_query: '',
        };
        expect(utils.stringParameters(params)).toEqual(
            expect.stringContaining('"authorization":"<hidden>"')
        );
        expect(utils.stringParameters(params)).not.toEqual(expect.stringContaining('secret'));
    });
});

describe('checkMissingRequestInputs', () => {
    test('({ a: 1, b: 2 }, [a])', () => {
        expect(utils.checkMissingRequestInputs({ a: 1, b: 2 }, ['a'], [])).toEqual({
            data: {
                a: 1,
                b: 2,
            },
            success: true,
        });
    });
    test('({ a: 1 }, [a, b])', () => {
        expect(
            utils.checkMissingRequestInputs({ a: 1 } as Partial<RequestParameters>, ['a', 'b'], [])
        ).toEqual({
            error: "missing parameter(s) 'b'",
            success: false,
        });
    });
    test('({ a: { b: { c: 1 } }, f: { g: 2 } }, [a.b.c, f.g.h.i])', () => {
        expect(
            utils.checkMissingRequestInputs(
                { a: { b: { c: 1 } }, f: { g: 2 } } as Partial<RequestParameters>,
                ['a.b.c', 'f.g.h.i'],
                []
            )
        ).toEqual({
            error: "missing parameter(s) 'f.g.h.i'",
            success: false,
        });
    });
    test('({ a: { b: { c: 1 } }, f: { g: 2 } }, [a.b.c, f.g.h])', () => {
        expect(
            utils.checkMissingRequestInputs({ a: { b: { c: 1 } }, f: { g: 2 } }, ['a.b.c', 'f'], [])
        ).toEqual({
            data: {
                a: { b: { c: 1 } },
                f: { g: 2 },
            },
            success: true,
        });
    });
    test('({ a: 1, __ow_headers: { h: 1, i: 2 } }, undefined, [h])', () => {
        expect(
            utils.checkMissingRequestInputs({ a: 1, __ow_headers: { h: 1, i: 2 } }, [], ['h'])
        ).toEqual({
            data: {
                a: 1,
                __ow_headers: { h: 1, i: 2 },
            },
            success: true,
        });
    });
    test('({ a: 1, __ow_headers: { f: 2 } }, [a], [h, i])', () => {
        expect(
            utils.checkMissingRequestInputs(
                { a: 1, __ow_headers: { f: 2 } } as Partial<RequestParameters>,
                ['a'],
                ['h', 'i']
            )
        ).toEqual({
            error: "missing header(s) 'h,i'",
            success: false,
        });
    });
    test('({ c: 1, __ow_headers: { f: 2 } }, [a, b], [h, i])', () => {
        expect(
            utils.checkMissingRequestInputs(
                { c: 1 } as Partial<RequestParameters>,
                ['a', 'b'],
                ['h', 'i']
            )
        ).toEqual({
            error: "missing header(s) 'h,i' and missing parameter(s) 'a,b'",
            success: false,
        });
    });
    test('({ a: 0 }, [a])', () => {
        expect(utils.checkMissingRequestInputs({ a: 0 }, ['a'], [])).toEqual({
            data: {
                a: 0,
            },
            success: true,
        });
    });
    test('({ a: null }, [a])', () => {
        expect(utils.checkMissingRequestInputs({ a: null }, ['a'], [])).toEqual({
            data: {
                a: null,
            },
            success: true,
        });
    });
    test("({ a: '' }, [a])", () => {
        expect(utils.checkMissingRequestInputs({ a: '' }, ['a'], [])).toEqual({
            error: "missing parameter(s) 'a'",
            success: false,
        });
    });
    test('({ a: undefined }, [a])', () => {
        expect(utils.checkMissingRequestInputs({ a: undefined }, ['a'], [])).toEqual({
            error: "missing parameter(s) 'a'",
            success: false,
        });
    });
});

describe('getBearerToken', () => {
    test('({ authorization: Bearer fake, __ow_headers: {} })', () => {
        expect(utils.getBearerToken({ authorization: 'Bearer fake', __ow_headers: {} })).toEqual(
            undefined
        );
    });
    test('({ authorization: Bearer fake, __ow_headers: { authorization: fake } })', () => {
        expect(
            utils.getBearerToken({
                authorization: 'Bearer fake',
                __ow_headers: { authorization: 'fake' },
            })
        ).toEqual(undefined);
    });
    test('({ __ow_headers: { authorization: Bearerfake} })', () => {
        expect(utils.getBearerToken({ __ow_headers: { authorization: 'Bearerfake' } })).toEqual(
            undefined
        );
    });
    test('({ __ow_headers: { authorization: Bearer fake} })', () => {
        expect(utils.getBearerToken({ __ow_headers: { authorization: 'Bearer fake' } })).toEqual(
            'fake'
        );
    });
    test('({ __ow_headers: { authorization: Bearer fake Bearer fake} })', () => {
        expect(
            utils.getBearerToken({ __ow_headers: { authorization: 'Bearer fake Bearer fake' } })
        ).toEqual('fake Bearer fake');
    });
});
