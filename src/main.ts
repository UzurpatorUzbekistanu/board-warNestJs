import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { FileLogger } from './common/logger/file-logger';

async function bootstrap() {
  const logger = new FileLogger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger });

  const envOrigins =
    process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? [];
  const extraOrigins = ['https://boardwar.toadres.pl', 'https://boardwar.bieda.it'];
  const normalizedOrigins = envOrigins.flatMap((o) =>
    o.startsWith('http://') ? [o, o.replace('http://', 'https://')] : [o],
  );
  const corsOrigins = Array.from(
    new Set([...normalizedOrigins, ...extraOrigins, 'http://localhost:3000', 'http://localhost:4000']),
  );

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Board War API')
    .setDescription('API documentation for Board War backend')
    .setVersion('1.0')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = 'api'; 
  SwaggerModule.setup(swaggerPath, app, swaggerDoc, {
    jsonDocumentUrl: 'api-json',
    customSiteTitle: 'Board War API Docs',
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
