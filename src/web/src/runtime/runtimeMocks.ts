import type { Runtime } from '@adobe/exc-app';
import type { Ims } from './RuntimeScript';

/**
 * Mock runtime object provided when running outside
 * of the Adobe Experience Cloud environment
 */
export const mockRuntime = {
    on: () => {},
    configured: true,
    lastConfigurationPayload: null,
    off: () => {},
    emit: () => {},
} satisfies Runtime;

/**
 * Mock IMS object provided when running outside
 * of the Adobe Experience Cloud environment
 */
export const mockIms = {
    token: 'mock-token',
    org: 'mock-org',
    profile: {
        account_type: 'mock-account-type',
        authId: 'mock-auth-id',
        avatar: 'mock-avatar',
        avatarSrc: 'mock-avatar-src',
        countryCode: 'mock-country-code',
        displayName: 'mock-display-name',
        email: 'mock-email',
        emailVerified: true,
        first_name: 'mock-first-name',
        job_function: 'mock-job-function',
        last_name: 'mock-last-name',
        name: 'mock-name',
        preferred_languages: ['mock-preferred-language'],
        projectedProductContext: [],
        session: 'mock-session',
        userId: 'mock-user-id',
    },
} satisfies Ims;
