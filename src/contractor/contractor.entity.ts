import { User } from '../user/user.entity';
import { Customer } from '../customer/customer.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Contractor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contarctor_name: string;

  @ManyToOne(() => User, (user) => user)
  user: User[];

  @ManyToOne(() => Customer, (customer) => customer)
  customer: Customer[];
}
