import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { parseCorsOrigins } from '../config/cors.config';

export function configureCors(app: INestApplication): void {
  const origins = parseCorsOrigins(process.env.CORS_ORIGIN);
  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });
}

export function configureValidation(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
}

export function configureSwagger(app: INestApplication): void {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const enableInProd = process.env.ENABLE_SWAGGER === 'true';

  if (nodeEnv === 'production' && !enableInProd) {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Chantiers360 API')
    .setDescription(
      'Documentation API MVP — authentification, chantiers, dashboards',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });
}
