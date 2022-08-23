import { Format } from 'logform';
import { format, LoggerOptions, transports } from 'winston';

export type GetTraceFn = () => { traceId: string; spanId: string; traceSampled?: boolean };
export type GetLabelsFn = () => Record<string, string>;
export type WinstonCloudRunConfig = {
  production: boolean;
  getTrace?: GetTraceFn;
  getLabels?: GetLabelsFn;
};

/**
 * Creates Winston format that specifies time and renames level to severity
 */
export function getCloudLoggingFormat({
  getTrace,
  getLabels,
}: Omit<WinstonCloudRunConfig, 'production'> = {}): Format {
  return format.combine(
    format.errors({ stack: true }),
    format((info) => {
      const { level, ...data } = info;

      return {
        ...data,
        ...(getTrace && { ...getTraceInfo(getTrace) }),
        severity: level.toUpperCase(),
        time: new Date().toISOString(),
        ...(getTrace && { ...getTraceInfo(getTrace) }),
        ...(getLabels && {
          'logging.googleapis.com/labels': getLabels(),
        }),
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
  getLabels,
}: WinstonCloudRunConfig): LoggerOptions {
  return {
    level: production ? 'info' : 'debug',
    format: getCloudLoggingFormat({ getTrace, getLabels }),
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
