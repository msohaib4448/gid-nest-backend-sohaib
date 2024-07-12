import { Controller, Injectable } from '@nestjs/common';
import { Crud } from '@dataui/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Contractor } from './contractor.entity';

@Injectable()
export class ContractorService extends TypeOrmCrudService<Contractor> {
  constructor(@InjectRepository(Contractor) repo) {
    super(repo);
  }
}

@Crud({
  model: {
    type: Contractor,
  },
  query: {
    join: {
      customer: {
        eager: true,
        // exclude: ['customer_name'],
      },
      user: {
        eager: false,
      },
    },
  },
})
@Controller('contractor')
export class ContractorController {
  constructor(public service: ContractorService) {}
}
