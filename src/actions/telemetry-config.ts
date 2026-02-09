import {
    defineTelemetryConfig,
    getAioRuntimeResourceWithAttributes,
    getPresetInstrumentations,
} from '@adobe/aio-lib-telemetry';
import {
    OTLPLogExporterProto,
    OTLPMetricExporterProto,
    OTLPTraceExporterProto,
    PeriodicExportingMetricReader,
    SimpleLogRecordProcessor,
} from '@adobe/aio-lib-telemetry/otel';

const NEW_RELIC_OTLP_ENDPOINT = 'https://otlp.nr-data.net:4318';

function newRelicConfig(params: Record<string, unknown>) {
    const makeExporterConfig = (endpoint: string) => ({
        url: `${NEW_RELIC_OTLP_ENDPOINT}/${endpoint}`,
        headers: {
            'api-key': params.NEW_RELIC_LICENSE_KEY as string,
        },
    });

    return {
        traceExporter: new OTLPTraceExporterProto(makeExporterConfig('v1/traces')),
        metricReaders: [
            new PeriodicExportingMetricReader({
                exporter: new OTLPMetricExporterProto(makeExporterConfig('v1/metrics')),
                // Short interval for serverless: the default 60s is too long for
                // actions that run for <1s. A short interval ensures the periodic
                // reader collects recorded metrics before the SDK shutdown flush.
                exportIntervalMillis: 5000,
            }),
        ],
        logRecordProcessors: [
            new SimpleLogRecordProcessor(new OTLPLogExporterProto(makeExporterConfig('v1/logs'))),
        ],
    };
}

const telemetryConfig = defineTelemetryConfig((params, isDev) => {
    return {
        sdkConfig: {
            serviceName: 'test-telemetry',
            instrumentations: getPresetInstrumentations('simple'),
            resource: getAioRuntimeResourceWithAttributes({
                'service.version': '0.0.1',
            }),
            ...newRelicConfig(params),
        },
        diagnostics: {
            logLevel: isDev ? 'debug' : 'info',
        },
    };
});

export { telemetryConfig };
