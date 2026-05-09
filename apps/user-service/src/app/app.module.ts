import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { validateEnv } from './config/env.validation';

/**
 * Repo-root env files for Nest (higher priority first). Missing files are skipped.
 * Prisma CLI loads `.env` at cwd by default — duplicate `DATABASE_URL` there for `npm run db:*`, or merge env manually.
 */
function nestEnvFilePaths(): string[] {
  const root = process.env.NX_WORKSPACE_ROOT ?? process.cwd();
  return [
    join(root, '.env.development.local'),
    join(root, '.env.local'),
    join(root, '.env.development'),
    join(root, '.env'),
  ];
}

/**
 * Root application module: global configuration, persistence, auth, and HTTP middleware.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: nestEnvFilePaths(),
      validate: validateEnv,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds window
        limit: 10, // max 10 requests
      },
    ]),

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  /** Registers request-scoped middleware for all routes. */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
