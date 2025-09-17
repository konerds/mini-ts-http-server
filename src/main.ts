import { getConfigs } from "./config";
import { ServerHTTP } from "./core/http";
import { handler } from "./handler";
import { logger } from "./logger";

const { HOST_SERVER, PORT_SERVER } = getConfigs();

new ServerHTTP(HOST_SERVER, PORT_SERVER, handler, logger).start();
