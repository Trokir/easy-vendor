import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { ConsentType } from '../types/legal-consent';

@Entity('legal_consents')
export class LegalConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ConsentType,
  })
  consentType: ConsentType;

  @Column({ type: 'varchar' })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, user => user.consents)
  user: User;

  @CreateDateColumn()
  acceptedAt: Date;
}
