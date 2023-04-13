import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './profile.model';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', './apps/profile/.env'],
    }),

    ClientsModule.registerAsync([{
      name: 'USER_SERVICE',
      imports:[ConfigModule],
      useFactory: async (configService: ConfigService) => ({      
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RMQ_URL')],
        queue: configService.get('RMQ_USER_QUEUE'),
      },
    }),
    inject: [ConfigService],
    },]),

    SequelizeModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        models: [Profile],
        autoLoadModels: true,
        synchronize: true,  
      }),
      inject: [ConfigService]    
    }),
  
    SequelizeModule.forFeature([Profile]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
