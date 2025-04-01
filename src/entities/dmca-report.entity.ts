import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dmca_reports')
export class DmcaReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contentUrl: string;

  @Column()
  complainantName: string;

  @Column()
  complainantEmail: string;

  @Column()
  complainantPhone: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: false })
  isProcessed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'text', nullable: true })
  processingNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 