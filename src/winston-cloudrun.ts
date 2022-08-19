import { Format } from 'logform';
import { format, LoggerOptions, transports } from 'winston';

export type GetTraceFn = () => { traceId: string; spanId: string; traceSampled?: boolean };
export type GetTenantIdFn = () => string;
export type GetCorrelationIdFn = () => string;
export type WinstonCloudRunConfig = { production: boolean; getTrace?: GetTraceFn };

/**
 * Creates Winston format that specifies time and renames level to severity
 */
export function getCloudLoggingFormat({
  getTrace,
  getTenantIdFn,
  getCorrelationIdFn,
}: {
  getTrace?: GetTraceFn;
  getTenantIdFn?: GetTenantIdFn;
  getCorrelationIdFn?: GetCorrelationIdFn;
} = {}): Format {
  return format.combine(
    format.errors({ stack: true }),
    format((info) => {
      const { level, ...data } = info;

      return {
        ...data,
        ...(getTrace && { ...getTraceInfo(getTrace) }),
        ...(getCorrelationIdFn && {
          'logging.googleapis.com/labels': {
            ...getCorrelationId(getCorrelationIdFn),
            ...(getTenantIdFn && { ...getTenantId(getTenantIdFn) }),
          },
        }),
        severity: level.toUpperCase(),
        time: new Date().toISOString(),
      } as never;
    })(),
    format.json()
  );
}

/**
 * Creates simple winston config for Cloud Run
 *
 * Log level is set like this: ```production ? 'info' : 'debug'```
 */
export function getWinstonCloudRunConfig({
  production,
  getTrace,
}: WinstonCloudRunConfig): LoggerOptions {
  return {
    level: production ? 'info' : 'debug',
    format: getCloudLoggingFormat({ getTrace }),
    transports: [new transports.Console()],
  };
}

function getTraceInfo(getTrace: GetTraceFn) {
  const { traceId, spanId, traceSampled = true } = getTrace();

  return {
    'logging.googleapis.com/trace': traceId,
    'logging.googleapis.com/spanId': spanId,
    'logging.googleapis.com/trace_sampled': traceSampled,
  };
}

export function getCorrelationId(getCorrelationIdFn: GetCorrelationIdFn) {
  return {
    'Correlation-Id': getCorrelationIdFn(),
  };
}

export function getTenantId(getTenantIdFn: GetTenantIdFn) {
  return {
    'Tenant-Id': getTenantIdFn(),
  };
}
