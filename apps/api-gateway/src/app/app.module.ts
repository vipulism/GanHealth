import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health.controller';
import { ProxyModule } from './proxy/proxy.module';

/**
 * Repo-root env files for Nest (higher priority first). Missing files are skipped.
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
 * API gateway root module: configuration, edge throttling, proxy routes, and request middleware.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: nestEnvFilePaths(),
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    ProxyModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  /** Registers request-scoped middleware for all routes. */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
