import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport  } from '@nestjs/microservices';
import { UserController } from './user.controller';
import { ProfileController } from './profile.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', './apps/gateway/.env'],
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

    ClientsModule.registerAsync([{
      name: 'PROFILE_SERVICE',
      imports:[ConfigModule],
      useFactory: async (configService: ConfigService) => ({      
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RMQ_URL')],
          queue: configService.get('RMQ_PROFILE_QUEUE'),
        },
      }),
      inject: [ConfigService],
    },]),

    JwtModule.registerAsync({
      imports:[ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRY'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController, ProfileController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class GatewayModule {}
