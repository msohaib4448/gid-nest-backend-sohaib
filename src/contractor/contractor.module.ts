import { Module } from '@nestjs/common';
import {
  ContractorController,
  ContractorService,
} from './contractor.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Contractor } from './contractor.entity';
import { Customer } from 'src/customer/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contractor, User, Customer])],

  providers: [ContractorService],
  controllers: [ContractorController],
  exports: [ContractorService],
})
export class ContractorModule {}
