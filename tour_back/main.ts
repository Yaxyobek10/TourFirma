import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
    }), );
    


    const config = new DocumentBuilder()
    .setTitle('Main Service API')
    .setDescription('API hujjatlari (Swagger UI)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  }); 


  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const PORT = process.env.ADMIN_PORT || 5005;

  await app.listen(PORT);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs: https://localhost:${PORT}/api/docs`);
}
bootstrap();






