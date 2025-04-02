import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class UserPrivacyPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'boolean', default: false })
  ccpaOptOut: boolean;

  @Column({ type: 'timestamp', nullable: true })
  optOutDate: Date;

  @Column({ type: 'varchar', nullable: true })
  region: string;

  @Column({ type: 'boolean', default: false })
  dataDeleteRequested: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleteRequestDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  additionalPreferences: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 