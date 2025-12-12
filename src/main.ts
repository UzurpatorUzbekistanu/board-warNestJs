import { ValidationPipe } from '@nestjs/common'; // globalna walidacja
import { NestFactory } from '@nestjs/core'; // tworzenie aplikacji
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // swagger
import { AppModule } from './app.module'; // modul glownego app
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // globalny filter
import { FileLogger } from './common/logger/file-logger'; // logger do pliku

async function bootstrap() {
  const logger = new FileLogger('Bootstrap'); // instancja loggera
  const app = await NestFactory.create(AppModule, { logger }); // tworz app z loggerem

  app.setGlobalPrefix('api'); // prefix sciezek

  const envOrigins =
    process.env.CORS_ORIGIN?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? []; // konfiguracja env
  const extraOrigins = [
    'https://boardwar.toadres.pl',
    'https://boardwar.bieda.it',
  ]; // dodatkowe originy prod
  const normalizedOrigins = envOrigins.flatMap((o) =>
    o.startsWith('http://') ? [o, o.replace('http://', 'https://')] : [o],
  );
  const corsOrigins = Array.from(
    new Set([
      ...normalizedOrigins,
      ...extraOrigins,
      'http://localhost:3000',
      'http://localhost:4000',
    ]),
  );

  app.enableCors({
    origin: corsOrigins, // dozwolone originy
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // metody
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'], // naglowki
    credentials: true, // cookies/creds
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // walidacja DTO
  app.useGlobalFilters(new AllExceptionsFilter()); // globalny filter wyjatkow

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Board War API') // tytul docs
    .setDescription('API documentation for Board War backend') // opis
    .setVersion('1.0') // wersja
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig); // generuj specyfikacje
  const swaggerPath = 'api/docs';
  SwaggerModule.setup(swaggerPath, app, swaggerDoc, {
    jsonDocumentUrl: 'api/api-json',
    customSiteTitle: 'Board War API Docs',
  });

  await app.listen(process.env.PORT ?? 3000); // start serwera
}

void bootstrap();
