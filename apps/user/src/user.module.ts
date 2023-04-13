import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', './apps/user/.env'],
    }),

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

  SequelizeModule.forRootAsync({
    imports:[ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      dialect: 'postgres',
      host: configService.get('POSTGRES_HOST'),
      port: configService.get<number>('POSTGRES_PORT'),
      username: configService.get('POSTGRES_USER'),
      password: configService.get('POSTGRES_PASSWORD'),
      database: configService.get('POSTGRES_DB'),
      models: [User],
      autoLoadModels: true,
      synchronize: true,  
    }),
    inject: [ConfigService]    
  }),

  SequelizeModule.forFeature([User]),
  
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
  controllers: [UserController],
  providers: [UserService, AuthService],
})
export class UserModule {}
