import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const createUserObject = {
  name: 'New Test User',
  email: 'test@example.com',
  address: '123 Street',
  phone: '1234567890',
  gender: 'Male',
  profession: 'Job Holder',
};

const updateUserObject = {
  ...createUserObject,
  id: 1,
  name: 'Updated User',
};

// * Partial Test Cases
describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, name: 'Test User' }];
      mockUserRepository.find.mockResolvedValue(users);

      expect(await service.findAll()).toEqual(users);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUserRepository.save.mockResolvedValue(updateUserObject);

      const createUserData = await service.create(createUserObject);

      expect(createUserData).toEqual(updateUserObject);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      mockUserRepository.findOne.mockResolvedValue(updateUserObject);
      mockUserRepository.save.mockResolvedValue(updateUserObject);

      expect(await service.update(updateUserObject)).toEqual(updateUserObject);
    });

    it('should throw NotFoundException if updateUserObject does not exist', async () => {
      //   const updateUserObject = { id: 1, name: 'Updated User' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateUserObject)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user ID is not provided', async () => {
      await expect(service.update(updateUserObject)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // const user = { id: 1, name: 'Test User' };
      mockUserRepository.findOne.mockResolvedValue(updateUserObject);

      expect(await service.findOne(1)).toEqual(createUserObject);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      expect(await service.delete(1)).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
