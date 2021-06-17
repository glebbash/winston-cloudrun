# winston-cloudrun

[![Deploy](https://github.com/glebbash/winston-cloudrun/workflows/build/badge.svg)](https://github.com/glebbash/winston-cloudrun/actions)
[![Coverage Status](https://coveralls.io/repos/github/glebbash/winston-cloudrun/badge.svg?branch=master)](https://coveralls.io/github/glebbash/winston-cloudrun?branch=master)

Winston Cloud Run config for logging to stdout in json format with correctly specified `time` and `severity`.

Installation:

```sh
npm i winston-cloudrun
```

Usage:

```ts
import { createLogger } from 'winston';
import { getWinstonCloudRunConfig } from 'winston-cloudrun';

const logger = createLogger(getWinstonCloudRunConfig({
  production: true
}));

logger.info('Processing important task...', { data: 'abc' });
/*
{ "severity": "INFO", message: "Processing important task...", data: "abc", time: "2021-06-17T10:39:00.576Z" }
*/
```

Or use only format:

```ts
...
import { getCloudLoggingFormat } from 'winston-cloudrun';

const logger = createLogger({
  format: getCloudLoggingFormat(),
  ...
});
```

Bootstrapped with: [create-ts-lib-gh](https://github.com/glebbash/create-ts-lib-gh)

This project is [Mit Licensed](LICENSE).
