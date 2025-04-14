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
