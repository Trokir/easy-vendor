import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('legal_consents')
export class LegalConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  consentType: string;

  @Column({ type: 'varchar' })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  acceptedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
