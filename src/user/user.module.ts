import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController, UsersService } from './user.controller';
import { User } from './user.entity';
import { Customer } from '../customer/customer.entity';
import { CacheMiddleware } from 'src/middleware/cache-middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, Customer])],
  controllers: [UserController],
  providers: [UsersService, CacheMiddleware],
  exports: [UsersService],
})
export class UserModule {}
