import {
  ArgumentsHost, // kontekst wywolania
  Catch, // dekorator filtra
  ExceptionFilter, // interfejs filtra
  HttpException, // bledy HTTP
  HttpStatus, // kody statusu
} from '@nestjs/common';
import { Request, Response } from 'express'; // typy request/response
import { FileLogger } from '../logger/file-logger'; // logger do pliku

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new FileLogger('Exceptions'); // kanal logowania bledow

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // kontekst HTTP
    const response = ctx.getResponse<Response>(); // odpowiedz
    const request = ctx.getRequest<Request>(); // zapytanie

    const isHttp = exception instanceof HttpException; // sprawdz czy to HttpException
    const status = isHttp
      ? exception.getStatus() // wezwij status z obiektu
      : HttpStatus.INTERNAL_SERVER_ERROR; // default 500

    const responseBody = isHttp
      ? exception.getResponse() // jesli HttpException, uzyj getResponse
      : 'Internal server error'; // fallback string

    const trace = (exception as Error)?.stack; // stos bledu

    this.logger.error(
      typeof responseBody === 'string'
        ? responseBody
        : JSON.stringify(responseBody), // wiadomosc
      trace, // stos
      `${request.method} ${request.url}`, // kontekst zapytania
    );

    response.status(status).json({
      statusCode: status, // kod
      path: request.url, // sciezka
      method: request.method, // metoda
      timestamp: new Date().toISOString(), // kiedy
      message: responseBody, // tresc bledu
    });
  }
}
