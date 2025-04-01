import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('legal_consents')
export class LegalConsent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  documentType: string;

  @Column({ nullable: true })
  ip: string;

  @ManyToOne(() => User, user => user.consents)
  user: User;

  @CreateDateColumn()
  acceptedAt: Date;
} 