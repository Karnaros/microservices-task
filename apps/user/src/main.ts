import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService;


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RMQ_URL')],
        queue: configService.get('RMQ_USER_QUEUE'),
      },
    },    
  );
  await app.listen();
}
bootstrap();
