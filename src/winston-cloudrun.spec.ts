import { TransformableInfo } from 'logform';

import { getCloudLoggingFormat, getWinstonCloudRunConfig } from './winston-cloudrun';

describe('winston-cloudrun-config', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWinstonCloudRunConfig', () => {
    it('sets correct level for stage', () => {
      expect(
        getWinstonCloudRunConfig({
          production: true,
        }).level
      ).toBe('info');

      expect(
        getWinstonCloudRunConfig({
          production: false,
        }).level
      ).toBe('debug');
    });
  });

  describe('getCloudLoggingFormat', () => {
    it('transforms input correctly', () => {
      const input: TransformableInfo = {
        level: 'info',
        message: 'hello there',
      };

      const dateSpy = jest.spyOn(Date.prototype, 'toISOString');

      const format = getCloudLoggingFormat();
      const transformed = format?.transform(input);

      expect(transformed).toEqual({
        message: input.message,
        severity: 'INFO',

        // current date in ISO format
        time: dateSpy.mock.results[0].value,

        // winston internal stringified version of data
        [Symbol.for('message')]: transformed?.[Symbol.for('message') as never],
      });
    });

    it('transforms input correctly (with tracing)', () => {
      const input: TransformableInfo = {
        level: 'info',
        message: 'hello there',
      };

      const dateSpy = jest.spyOn(Date.prototype, 'toISOString');

      const traceId = 'traceId';
      const spanId = 'spanId';
      const traceSampled = false;
      const format = getCloudLoggingFormat({
        getTrace: () => ({
          traceId,
          spanId,
          traceSampled,
        }),
      });
      const transformed = format?.transform(input);

      expect(transformed).toEqual({
        message: input.message,
        severity: 'INFO',

        'logging.googleapis.com/spanId': spanId,
        'logging.googleapis.com/trace': traceId,
        'logging.googleapis.com/trace_sampled': traceSampled,

        time: dateSpy.mock.results[0].value, // current date in ISO format

        // winston internal stringified version of data
        [Symbol.for('message')]: transformed?.[Symbol.for('message') as never],
      });
    });
  });
});
