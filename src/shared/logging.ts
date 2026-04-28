import * as rfs from 'rotating-file-stream';
import * as path from 'node:path';
import { LoggerModule, nativeLoggerOptions } from 'nestjs-pino';
import { isProd } from './utils';

const logLevels = {
  log: 'info',
  debug: 'debug',
  warn: 'warn',
  error: 'error',
  verbose: 'trace',
};

export const configureLoggingModule = () => {
  return LoggerModule.forRoot({
    pinoHttp: isProd
      ? {
          ...nativeLoggerOptions,
          level: logLevels[process.env.LOG_LEVEL] || 'info',
          stream: rfs.createStream(
            (time) => {
              // first file is always base log
              if (!time) {
                return 'app.log';
              }

              const timestamp = new Date()
                .toISOString()
                .replace(/:/g, '-') // windows-safe filenames
                .replace(/\..+/, ''); // remove ms
              return `app-${timestamp}.log`;
            },
            {
              size: (process.env.LOG_MAX_FILE_SIZE || 1024) + 'K',
              path: path.join(process.cwd(), 'logs'),
            },
          ),
        }
      : {
          level: logLevels[process.env.LOG_LEVEL] || 'info',
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                options: {
                  colorize: false,
                  singleLine: true,
                  translateTime: 'HH:MM:ss.l',
                  messageFormat: '{context} - {msg}',
                  ignore: 'pid,hostname,context',
                },
              },
            ],
          },
        },
  });
};
