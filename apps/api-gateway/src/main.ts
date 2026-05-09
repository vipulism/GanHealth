import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
      : true,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GanHealth API Gateway')
    .setDescription(
      'Edge routing, JWT validation, and throttling. Proxied path map is documented in apps/api-gateway/README.md.',
    )
    .setVersion('1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port =
    configService.get<number>('GATEWAY_PORT') ??
    configService.get<number>('PORT') ??
    3100;
  const listenPort = Number.isFinite(port) ? port : 3100;

  await app.listen(listenPort);
  Logger.log(
    `API Gateway listening on: http://localhost:${listenPort}/${globalPrefix}`,
  );
}

bootstrap();
