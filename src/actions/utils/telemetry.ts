/**
 * Telemetry utilities for instrumented web actions.
 *
 * Provides {@link instrumentWebAction} — a drop-in replacement for
 * `instrumentEntrypoint` that automatically adds HTTP server semantic
 * conventions required by APM backends like New Relic.
 *
 * For non-web actions, continue using `instrumentEntrypoint` directly.
 */

import {
    defineMetrics,
    getInstrumentationHelpers,
    instrumentEntrypoint,
    type EntrypointInstrumentationConfig,
} from '@adobe/aio-lib-telemetry';
import { SpanKind } from '@adobe/aio-lib-telemetry/otel';

import type { InstrumentedActionParams } from '@/actions/utils/runtime.ts';

// ── Standard HTTP server metric ──────────────────────────────────────
// https://opentelemetry.io/docs/specs/semconv/http/http-metrics/

const httpMetrics = defineMetrics(meter => ({
    requestDuration: meter.createHistogram('http.server.request.duration', {
        description: 'Duration of HTTP server requests',
        unit: 's',
    }),
}));

// ── Internal helpers ─────────────────────────────────────────────────

function getHttpContext(params: InstrumentedActionParams) {
    return {
        method: ((params.__ow_method as string) || 'GET').toUpperCase(),
        path: (params.__ow_path as string) || '/',
        route: `/${process.env.__OW_ACTION_NAME || 'unknown'}`,
    };
}

/**
 * Sets HTTP semantic convention attributes on the current span from
 * OpenWhisk request parameters.
 */
function setHttpRequestAttributes(params: InstrumentedActionParams) {
    const { currentSpan } = getInstrumentationHelpers();
    const { method, path, route } = getHttpContext(params);

    currentSpan.setAttribute('http.request.method', method);
    currentSpan.setAttribute('http.route', route);
    currentSpan.setAttribute('url.scheme', 'https');
    currentSpan.setAttribute('url.path', path);
    currentSpan.setAttribute('server.address', 'adobeioruntime.net');
}

/**
 * Extracts the HTTP status code from an action's return value.
 * Handles both success `{ statusCode }` and error `{ error: { statusCode } }` shapes.
 */
function extractStatusCode(result: unknown): number {
    if (typeof result !== 'object' || result === null) return 200;

    const res = result as Record<string, unknown>;
    if (typeof res.statusCode === 'number') return res.statusCode;

    if (res.error && typeof res.error === 'object') {
        const err = res.error as Record<string, unknown>;
        if (typeof err.statusCode === 'number') return err.statusCode;
    }

    return 200;
}

/**
 * Records the http.server.request.duration metric and sets the
 * http.response.status_code span attribute.
 */
function recordHttpResponse(
    params: InstrumentedActionParams,
    durationS: number,
    statusCode: number
) {
    const { method, route } = getHttpContext(params);

    httpMetrics.requestDuration.record(durationS, {
        'http.request.method': method,
        'http.response.status_code': statusCode,
        'http.route': route,
        'url.scheme': 'https',
    });

    const { currentSpan } = getInstrumentationHelpers();
    currentSpan.setAttribute('http.response.status_code', statusCode);
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Instruments a web action's entrypoint with HTTP server semantics.
 *
 * This is a drop-in replacement for `instrumentEntrypoint` that additionally:
 * - Sets the span kind to `SERVER`
 * - Adds HTTP semantic convention attributes from OpenWhisk `__ow_*` params
 * - Records the standard `http.server.request.duration` metric
 * - Sets `http.response.status_code` on the span
 *
 * These are required for APM backends (e.g. New Relic) to populate
 * throughput, Apdex, web transactions, and error rate dashboards.
 *
 * For non-web actions, use `instrumentEntrypoint` directly instead.
 *
 * @example
 * ```ts
 * import { instrumentWebAction } from '@/actions/utils/telemetry.ts';
 * import { telemetryConfig } from '@/actions/telemetry-config.ts';
 *
 * function main(params: InstrumentedActionParams) {
 *     // ... business logic only
 * }
 *
 * const instrumentedMain = instrumentWebAction(main, telemetryConfig);
 * export { instrumentedMain as main };
 * ```
 */
export function instrumentWebAction(
    fn: (params: InstrumentedActionParams) => unknown,
    config: EntrypointInstrumentationConfig
) {
    function wrappedMain(params: InstrumentedActionParams) {
        const start = performance.now();
        setHttpRequestAttributes(params);

        const finalize = (result: unknown) => {
            const durationS = (performance.now() - start) / 1000;
            recordHttpResponse(params, durationS, extractStatusCode(result));
            return result;
        };

        try {
            const result = fn(params);

            if (result instanceof Promise) {
                return result.then(finalize, (err: unknown) => {
                    const durationS = (performance.now() - start) / 1000;
                    recordHttpResponse(params, durationS, 500);
                    throw err;
                });
            }

            return finalize(result);
        } catch (error) {
            const durationS = (performance.now() - start) / 1000;
            recordHttpResponse(params, durationS, 500);
            throw error;
        }
    }

    return instrumentEntrypoint(wrappedMain, {
        ...config,
        spanConfig: {
            ...config.spanConfig,
            kind: SpanKind.SERVER,
        },
    });
}
