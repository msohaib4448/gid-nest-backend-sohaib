import { User } from '../user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_name: string;

  @OneToMany(() => User, (user) => user.customer)
  users: User[];
}

export class CreateCustomerDto {
  customer_name: string;
}
