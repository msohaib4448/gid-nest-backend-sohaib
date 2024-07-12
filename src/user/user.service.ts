import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // **Manual service Operations (NOT USED AT THE MOMEMT FOR API )
  // **USAGE ONLY TEST CASES

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(userData: CreateUserDto): Promise<User> {
    return this.userRepository.save(userData);
  }

  async update(userData: CreateUserDto): Promise<User> {
    const userId = userData?.id;

    if (!userId) {
      throw new NotFoundException('User ID must be provided for update.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.userRepository.save(userData);
  }

  async findOne(id: any): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async delete(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
