import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { SharedModule } from './shared/shared.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { configureLoggingModule } from './shared/logging';
import { AiModule } from './ai/ai.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UsersModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    SharedModule,
    PrismaModule,
    AuthModule,
    AiModule,
    configureLoggingModule(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          throttlers: [
            {
              ttl: 60000,
              limit: config.get('AI_RATE_LIMIT_RPM') ?? 20,
            },
          ],
          setHeaders: true,
        };
      },
    }),
  ],
})
export class AppModule {}
