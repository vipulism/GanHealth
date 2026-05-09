/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './app/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  const portRaw = configService.get<string>('PORT');
  const port =
    portRaw !== undefined && portRaw !== ''
      ? Number.parseInt(portRaw, 10)
      : 3000;
  const listenPort = Number.isFinite(port) ? port : 3000;



  const config = new DocumentBuilder()
    .setTitle('GanHealth API')
    .setDescription('User & Auth APIs')
    .setVersion('1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);


  await app.listen(listenPort);
  Logger.log(
    `🚀 Application is running on: http://localhost:${listenPort}/${globalPrefix}`,
  );
}

bootstrap();
