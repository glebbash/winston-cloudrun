import { Format } from 'logform';
import { format, LoggerOptions, transports } from 'winston';

export type GetTraceFn = () => string;
export type WinstonCloudRunConfig = { production: boolean; getTrace?: GetTraceFn };

/**
 * Creates Winston format that specifies time and renames level to severity
 */
export function getCloudLoggingFormat({ getTrace }: { getTrace?: GetTraceFn } = {}): Format {
  return format.combine(
    format.errors({ stack: true }),
    format((info) => {
      const { level, ...data } = info;

      return {
        ...data,
        ...(getTrace && { trace: getTrace() }),
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
