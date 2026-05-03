import { type INestApplication, Logger } from '@nestjs/common';

export function registerProcessErrorHandlers(app: INestApplication) {
  const logger = new Logger(registerProcessErrorHandlers.name);

  process.on('uncaughtException', async (error: Error) => {
    logger.error(
      'Uncaught exception: ' + error.name + ': ' + error.message,
      error.stack,
    );
    await shutdown(app);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    logger.error(
      'Unhandled Rejection at: ' +
        promise +
        ' reason: ' +
        (reason instanceof Error ? reason.stack : JSON.stringify(reason)),
    );
    await shutdown(app);
  });
}

async function shutdown(app: INestApplication) {
  const logger = new Logger(shutdown.name);
  logger.error('Starting shutdown');

  try {
    await app.close();
    logger.log('App closed');
  } catch (err) {
    logger.error(
      'Error during shutdown',
      err instanceof Error ? err.stack : String(err),
    );
  } finally {
    process.exit(1);
  }
}
