import { Catch, ArgumentsHost, HttpStatus,  ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        /* const logger = new Logger('RpcExceptionFilter');
        logger.log(exception); */
        const ctx = host.switchToHttp();
        const { httpAdapter } = this.httpAdapterHost;

        const statusCode = exception.hasOwnProperty('statusCode') ? exception['statusCode'] :  HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception.hasOwnProperty('message') ? exception['message'] : exception;

        const responseBody = {
            statusCode: statusCode,
            message: message,
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            };

        httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
    }  
}
