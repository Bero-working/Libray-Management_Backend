import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './setup-app';
import { configureSwagger } from './setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  configureApp(app);
  configureSwagger(app);

  await app.listen(Number(process.env.PORT ?? 3002), '0.0.0.0');

}
void bootstrap();
