/**
 * A single action demonstrating various OpenTelemetry features via @adobe/aio-lib-telemetry:
 *
 * - Instrumented web action entrypoint (root span, kind=SERVER, HTTP semantics)
 * - Instrumented function call (child span)
 * - Telemetry-aware logging (auto-correlated with traces)
 * - Custom metrics (counter + histogram)
 * - Span attributes and events
 * - Context carrier serialization (for distributed tracing)
 */

import {
    defineMetrics,
    getInstrumentationHelpers,
    instrument,
    serializeContextIntoCarrier,
} from '@adobe/aio-lib-telemetry';

import { telemetryConfig } from '@/actions/telemetry-config.ts';
import { STATUS_CODES } from '@/actions/utils/http.ts';
import { InstrumentedActionParams } from '@/actions/utils/runtime.ts';
import { instrumentWebAction } from '@/actions/utils/telemetry.ts';
import { errorResponse } from '@/actions/utils/utils.ts';

// ── Metrics ──────────────────────────────────────────────────────────
// defineMetrics creates metric instruments that persist across warm starts.
// The actual aggregation happens in the backend (e.g. New Relic).

const metrics = defineMetrics(meter => ({
    invocations: meter.createCounter('telemetry_example.invocations', {
        description: 'Number of times the action has been invoked',
    }),
    workDuration: meter.createHistogram('telemetry_example.work_duration_ms', {
        description: 'Duration of the simulated work in milliseconds',
        unit: 'ms',
    }),
}));

// ── Instrumented child function ──────────────────────────────────────
// instrument() wraps this function in its own child span, visible as a
// separate node in the trace waterfall.

function simulateWork(iterations: number): { iterations: number; result: number } {
    const { logger, currentSpan } = getInstrumentationHelpers();

    currentSpan.setAttribute('work.iterations', iterations);
    logger.info(`Starting simulated work with ${iterations} iterations`);

    let result = 0;
    for (let i = 0; i < iterations; i++) {
        result += Math.random();
    }

    currentSpan.addEvent('work-complete', { 'work.result': result });
    logger.info(`Simulated work complete, result: ${result}`);

    return { iterations, result };
}

const instrumentedSimulateWork = instrument(simulateWork);

// ── Entrypoint ───────────────────────────────────────────────────────

function main(params: InstrumentedActionParams) {
    const { logger, currentSpan } = getInstrumentationHelpers();

    try {
        // 1. Record an invocation metric
        metrics.invocations.add(1);

        // 2. Read params & set span attributes
        const message = (params.message as string) || 'Hello from telemetry-example!';
        const iterations = (params.iterations as number) ?? 5;

        currentSpan.setAttribute('input.message', message);
        currentSpan.setAttribute('input.iterations', iterations);

        // 3. Log a message (auto-correlated with the current trace)
        logger.info(`Processing: message="${message}", iterations=${iterations}`);

        // 4. Add a span event
        currentSpan.addEvent('processing-started', {
            'message.length': message.length,
        });

        // 5. Call an instrumented child function (creates a child span)
        const workStart = performance.now();
        const workResult = instrumentedSimulateWork(iterations);
        const workDurationMs = performance.now() - workStart;

        // 6. Record the work duration in a custom histogram metric
        metrics.workDuration.record(workDurationMs);

        // 7. Serialize the trace context (for passing to downstream services)
        const contextCarrier = serializeContextIntoCarrier();

        currentSpan.addEvent('processing-complete');

        return {
            statusCode: STATUS_CODES.OK,
            body: {
                message,
                workResult,
                workDurationMs,
                contextCarrier,
                timestamp: new Date().toISOString(),
            },
        };
    } catch (error) {
        if (typeof error === 'string' || (typeof error === 'object' && error !== null)) {
            logger.error(String(error));
        }
        return errorResponse(STATUS_CODES.InternalServerError, 'server error');
    }
}

// instrumentWebAction wraps instrumentEntrypoint with HTTP server semantics:
// SERVER span kind, http.request.method, http.route, http.response.status_code,
// and the standard http.server.request.duration metric.
const instrumentedMain = instrumentWebAction(main, telemetryConfig);
export { instrumentedMain as main };
