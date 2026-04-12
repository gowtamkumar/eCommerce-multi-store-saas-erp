import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { json } from 'express'
import { AppModule } from './app.module'
import getLogLevels from './lib/logger'
import { SwaggerConfig } from './lib/swagger'

async function bootstrap() {
  const logger = new Logger('Bootstrap Logger')

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLogLevels(process.env.NODE_ENV === 'production'),
  })

  const API_PREFIX = 'api/v1' // You can customize this prefix
  app.setGlobalPrefix(API_PREFIX)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipUndefinedProperties: true,
    }),
  )

  app.enableCors({
    origin: true,
    credentials: true,
  })

  app.use(compression())
  app.use(cookieParser())
  app.use(json({ limit: '20mb' }))

  SwaggerConfig(app)

  const PORT = process.env.API_PORT || 3900
  await app.listen(PORT, () => {
    logger.log(`Application listening on port mode. http://${process.env.HOST}:${PORT}`)
    logger.log(`Application api docs on port mode. http://${process.env.HOST}:${PORT}/api/docs`)
  })
}
bootstrap()
