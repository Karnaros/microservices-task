import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { RpcExceptionFilter } from './filters/rpc-exceptions.filter';
import { HttpExceptionFilter } from './filters/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const configService = app.get<ConfigService>(ConfigService);
  const adapterHost =  app.get(HttpAdapterHost);
  app.useGlobalFilters( new RpcExceptionFilter( adapterHost ), new HttpExceptionFilter( adapterHost.httpAdapter ));

  const PORT = configService.get('PORT') ?? 7000;

  await app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
}
bootstrap();
