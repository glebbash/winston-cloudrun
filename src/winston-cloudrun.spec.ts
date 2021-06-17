import { TransformableInfo } from 'logform';

import { getCloudLoggingFormat, getWinstonCloudRunConfig } from './winston-cloudrun';

describe('winston-cloudrun-config', () => {
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
  });
});
