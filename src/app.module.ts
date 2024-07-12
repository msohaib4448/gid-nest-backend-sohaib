import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configDotenv } from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerModule } from './customer/customer.module';
import { ContractorModule } from './contractor/contractor.module';
import { TasksModule } from './tasks/tasks.module';
import typeormConfig from './config/typeorm';
import { BullBoardModule } from './bull-board/bull-board.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

configDotenv();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        }),
      }),
    }),
    forwardRef(() => UserModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => ContractorModule),
    forwardRef(() => TasksModule),
    BullBoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
