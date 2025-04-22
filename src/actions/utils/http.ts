/**
 * Helper constant for HTTP status codes
 *
 * Caution: 500 errors will cause an action to be retried for 24 hours with exponential backoff
 *
 * https://developer.adobe.com/events/docs/support/faq/#what-happens-if-my-webhook-is-down-why-is-my-event-registration-marked-as-unstable
 */
export const STATUS_CODES = {
    OK: 200,
    Created: 201,
    Accepted: 202,
    NoContent: 204,
    BadRequest: 400,
    Unauthorized: 401,
    InternalServerError: 500,
} as const;

export type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];
