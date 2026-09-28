import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

// Normalizes every thrown error (domain HttpExceptions and anything
// unexpected) into one consistent JSON error shape for the frontend.
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? exception.getResponse() : { message: 'Internal server error' };

    if (!isHttp) {
      this.logger.error(exception);
    }

    const payload = typeof body === 'string' ? { message: body } : body;

    response.status(status).json({
      statusCode: status,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
