import { Customer } from '../customer/customer.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  gender: string;

  @Column()
  profession: string;

  @Column({ nullable: true, default: 0 })
  age?: number | null | undefined;

  @ManyToOne(() => Customer, (customer) => customer.users)
  customer: Customer;
}

export class CreateUserDto {
  id?: number | undefined;
  name: string;
  email: string;
  address: string;
  phone: string;
  gender: string;
  profession: string;
  age?: number | undefined;
  customer?: any;
}
