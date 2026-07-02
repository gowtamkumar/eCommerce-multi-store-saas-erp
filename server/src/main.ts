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

  // CORS: reflect any origin only in non-production. In production, restrict to
  // an explicit allowlist (CORS_ORIGINS, comma-separated) plus any subdomain of
  // PLATFORM_HOST so tenant stores (e.g. acme.gowtam.com) keep working.
  const isProduction = process.env.NODE_ENV === 'production'
  const allowlist = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  const platformHost = process.env.PLATFORM_HOST

  app.enableCors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, server-to-server) with no Origin header.
      if (!origin) return callback(null, true)
      if (!isProduction) return callback(null, true)

      if (allowlist.includes(origin)) return callback(null, true)

      if (platformHost) {
        try {
          const { hostname } = new URL(origin)
          if (hostname === platformHost || hostname.endsWith(`.${platformHost}`)) {
            return callback(null, true)
          }
        } catch {
          // Malformed origin — fall through to rejection.
        }
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`), false)
    },
  })

  app.use(compression())
  app.use(cookieParser())
  // Capture the raw request body alongside the parsed JSON so webhook handlers
  // can verify HMAC signatures against the exact bytes the courier signed.
  app.use(
    json({
      limit: '20mb',
      verify: (req: any, _res, buf) => {
        if (buf && buf.length) req.rawBody = Buffer.from(buf)
      },
    }),
  )

  SwaggerConfig(app)

  const PORT = process.env.API_PORT || 3900
  await app.listen(PORT, () => {
    logger.log(`Application listening on port mode. http://${process.env.HOST}:${PORT}`)
    logger.log(`Application api docs on port mode. http://${process.env.HOST}:${PORT}/api/docs`)
  })
}
bootstrap()
