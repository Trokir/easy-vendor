import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar' })
  businessName: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  domain: string;

  @Column({ type: 'varchar' })
  templateType: string;

  @Column('jsonb', { default: {} })
  config: Record<string, any>;

  @ManyToOne(() => User, user => user.vendors)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
