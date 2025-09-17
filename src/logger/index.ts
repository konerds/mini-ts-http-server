import { createLogger, format, transports } from 'winston';

import { getConfigs } from '@config';

const { LOG_LEVEL } = getConfigs();

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  level: LOG_LEVEL,
  transports: [new transports.Console()],
});

export { logger };
