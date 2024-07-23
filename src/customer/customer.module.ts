import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController, CustomerService } from './customer.controller';
import { User } from '../user/user.entity';
import { Customer } from './customer.entity';
// import { CacheMiddleware } from 'src/middleware/cache-middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, User]), // Import and specify entities for this module
  ],

  providers: [CustomerService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(CacheMiddleware)
  //     .forRoutes({ path: 'customer', method: RequestMethod.GET });
  // }
}
