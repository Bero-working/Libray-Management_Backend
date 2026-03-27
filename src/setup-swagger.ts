import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api';

  const documentConfig = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription(
      'Interactive API documentation. Most endpoints require a bearer access token from the login endpoint.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the access token returned by /api/v1/auth/login.',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('swagger', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'swagger/json',
    customSiteTitle: 'Library Management Swagger',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const swaggerUrl = `/${apiPrefix}/swagger`;
  const swaggerJsonUrl = `/${apiPrefix}/swagger/json`;

  console.log(`Swagger UI available at ${swaggerUrl}`);
  console.log(`Swagger JSON available at ${swaggerJsonUrl}`);
}
