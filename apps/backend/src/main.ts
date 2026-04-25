import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Auto-validation for routes using DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  const config = new DocumentBuilder()
    .setTitle('Biobanco API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const doc = SwaggerModule.createDocument(app, config)
  app.use('/reference', apiReference({ content: doc, theme: 'fastify' }))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
