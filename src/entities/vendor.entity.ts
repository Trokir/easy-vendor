import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  businessName: string;

  @Column({ nullable: true, unique: true })
  domain: string;

  @Column()
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