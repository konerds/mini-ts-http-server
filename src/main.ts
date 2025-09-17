import { getConfigs } from '@config';
import { Handler } from '@handler';
import { ServerHTTP } from '@http';
import { logger } from '@logger';

const { HOST_SERVER, PATH_STATIC, PORT_SERVER } = getConfigs();

const server = new ServerHTTP(
  HOST_SERVER,
  PORT_SERVER,
  new Handler(PATH_STATIC, logger),
  logger
);

server.start();

async function onSignal(signal: NodeJS.Signals) {
  try {
    logger.info({ event: 'shutdown_signal', signal });
    await server.stop();
  } catch (e: any) {
    logger.error({ error: e?.message || e, event: 'shutdown_error' });
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', onSignal);
process.on('SIGTERM', onSignal);

process.on('uncaughtException', (e: any) => {
  if (e?.code === 'ECONNRESET') {
    return;
  }

  logger.error({ error: e?.message || e, event: 'uncaught_exception' });
});

process.on('unhandledRejection', (e: any) => {
  logger.error({ error: e?.message || e, event: 'unhandled_rejection' });
});
