import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter, } from '@nestjs/core';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      super.catch(exception, host);
    }
}
