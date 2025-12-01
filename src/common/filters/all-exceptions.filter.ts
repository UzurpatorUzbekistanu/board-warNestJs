import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileLogger } from '../logger/file-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new FileLogger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp
      ? exception.getResponse()
      : 'Internal server error';

    const trace = (exception as Error)?.stack;

    this.logger.error(
      typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
      trace,
      `${request.method} ${request.url}`,
    );

    response.status(status).json({
      statusCode: status,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      message: responseBody,
    });
  }
}
