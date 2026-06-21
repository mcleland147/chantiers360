import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  configureCors,
  configureSwagger,
  configureValidation,
} from './bootstrap/app-config';
import {
  assertJwtSecretConfigured,
  assertJwtSecretStrength,
} from './config/jwt-secret.validation';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const jwtSecret = process.env.JWT_SECRET;

  assertJwtSecretConfigured(jwtSecret);
  assertJwtSecretStrength(jwtSecret!, nodeEnv);

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  configureCors(app);
  configureValidation(app);
  configureSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
