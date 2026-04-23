import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { SharedModule } from './shared/shared.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoggerModule, nativeLoggerOptions } from 'nestjs-pino';
import { isProd } from './shared/utils';

const logLevels = {
  log: 'info',
  debug: 'debug',
  warn: 'warn',
  error: 'error',
  verbose: 'trace',
};

@Module({
  imports: [
    UsersModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    SharedModule,
    PrismaModule,
    AuthModule,
    LoggerModule.forRoot({
      pinoHttp: isProd
        ? {
            ...nativeLoggerOptions,
            level: logLevels[process.env.LOG_LEVEL] || 'info',
          }
        : {
            level: logLevels[process.env.LOG_LEVEL] || 'info',
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: false,
                singleLine: true,
                translateTime: 'HH:MM:ss.l',
                messageFormat: '{context} - {msg}',
                ignore: 'pid,hostname,context',
              },
            },
          },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
