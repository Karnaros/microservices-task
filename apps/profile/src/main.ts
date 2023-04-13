import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ProfileModule } from './profile.module';
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProfileModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RMQ_URL')],
        queue: configService.get('RMQ_PROFILE_QUEUE'),
      },
    },    
  );
  await app.listen();
}
bootstrap();
