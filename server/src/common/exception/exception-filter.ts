import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch() // Leaving this empty catches EVERYTHING
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // Determine status code
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    // Determine error message
    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

    // Log the error for the developer with more detail
    const errorLog = {
      statusCode: status,
      path: request.url,
      method: request.method,
      message: (message as any).message || message,
      error: exception instanceof Error ? exception.message : exception,
      stack: exception instanceof Error ? exception.stack : null,
    }

    this.logger.error(
      `HTTP Status: ${status} | Method: ${request.method} | URL: ${request.url} | Error: ${JSON.stringify(
        message,
      )}`,
      exception instanceof Error ? exception.stack : undefined,
    )

    // Send the custom formatted response
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: (message as any).message || (typeof message === 'string' ? message : 'Internal server error'),
      error: (message as any).error || (exception instanceof Error ? exception.name : 'Error'),
    })
  }
}
