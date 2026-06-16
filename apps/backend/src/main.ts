import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // The frontend always calls `${BASE_URL}api/<route>`, and the deploy reverse
  // proxy forwards the `/api` segment through to the backend. Serving every
  // route under `/api` keeps the path identical end-to-end — no prefix
  // stripping required anywhere.
  app.setGlobalPrefix('api')

  app.enableCors()

  // Auto-validation for routes using DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  const config = new DocumentBuilder()
    .setTitle('Bio Database API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const doc = SwaggerModule.createDocument(app, config)
  app.use('/api/reference', apiReference({ content: doc, theme: 'fastify' }))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
