import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ConsentType } from '../services/legal-consent/legal-consent.types';

@Entity('legal_consents')
export class LegalConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'consent_type' })
  consentType: ConsentType;

  @Column()
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'accepted_at' })
  acceptedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 