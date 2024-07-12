/* eslint-disable @typescript-eslint/no-unused-vars */

import { Controller, Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Crud, Override, CrudRequest, ParsedRequest } from '@dataui/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Repository } from 'typeorm';

import { RequestQueryBuilder, CondOperator } from '@dataui/crud-request';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    super(userRepo);
  }

  // * Using Query Builder manually get data from Request
  // async getMany(req: CrudRequest): Promise<any> {
  //   const { parsed } = req;
  //   console.log(parsed);
  //   const queryBuilder = this.userRepo
  //     .createQueryBuilder('user')
  //     .leftJoinAndSelect('user.customer', 'customer');

  //   if (parsed.search) {
  //     // Apply search conditions from parsed.search
  //     parsed.search?.forEach((condition) => {
  //       queryBuilder.andWhere(condition.field, condition.value);
  //     });
  //   }

  //   if (parsed.filter) {
  //     // Apply filter conditions from parsed.filter
  //     parsed.filter.forEach((condition) => {
  //       queryBuilder.andWhere(condition.field, condition.value);
  //     });
  //   }

  //   if (parsed.sort) {
  //     // Apply sorting from parsed.sort
  //     parsed.sort.forEach((sort) => {
  //       queryBuilder.addOrderBy(sort.field, sort.order);
  //     });
  //   }

  //   // Pagination
  //   if (parsed.limit) {
  //     queryBuilder.take(parsed.limit);
  //   }
  //   if (parsed.offset) {
  //     queryBuilder.skip(parsed.offset);
  //   }

  //   const query = cleanObject(parsed);
  //   const dataCount = {
  //     totalCount: await queryBuilder.getCount(),
  //     query,
  //   };
  //   const data = await queryBuilder.getMany();

  //   const dataObject = { ...dataCount, data };
  //   console.log(dataObject, 'dataObject');

  //   return dataObject;
  // }
}

@Crud({
  model: {
    type: User,
  },
  query: {
    join: {
      customer: {
        // eager: true,
        // exclude: ['customer_name'],
      },
    },
  },
  routes: {
    updateOneBase: {
      allowParamsOverride: true,
    },
  },
})
@Controller('users')
export class UserController {
  constructor(
    public service: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
  ) {}

  @Override()
  async getMany(@ParsedRequest() req: CrudRequest) {
    // checking RequestQueryBuilder making object
    const queryString = RequestQueryBuilder.create({
      fields: ['name', 'email'],
      search: { age: 0, name: 'sohaib' },
      join: [
        {
          field: 'customer',
          select: ['customer_name'],
          on: [{ field: 'customer.id', operator: 'eq', value: 1 }],
        },
      ],
      sort: [{ field: 'id', order: 'DESC' }],

      filter: [
        { field: 'name', operator: CondOperator.EQUALS, value: 'sohaib' },
        { field: 'name', operator: CondOperator.NOT_EQUALS, value: 'test' },
      ],
      page: 1,
      limit: 25,
      resetCache: true,
    });

    // ? using to make cache for the getMany users api
    // * await this.cacheManager.set('users', {});
    // * const cachedData = await this.cacheManager.get('users');
    // * console.log(
    // *   cachedData,
    // *   '-------------------------------Redis cached users',
    // *   checkRedisReturnData(cachedData),
    // * );

    // * if (checkRedisReturnData(cachedData)) {
    // *   console.log(cachedData, 'returned cachedData');
    // *   return cachedData;
    // * } else {
    // *   const users = await this.service.getMany(req);
    // *   await this.cacheManager.set('users', users, 60000);
    // *   console.log(
    // *     users,
    // *     '-------------------------------Redis cache updated with users',
    // *   );
    // *   return users;
    // * }
    // * const cacheKey = 'users';

    // ? using to make cache for the getMany users api this route for user is still caching with middleware/cache-middleware

    const data = await this.service.getMany(req);
    return data;
  }
}
