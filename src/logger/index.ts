import { createLogger, format, transports } from "winston";
import { getConfigs } from "../config";

const { LOG_LEVEL } = getConfigs();

const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

export { logger };
