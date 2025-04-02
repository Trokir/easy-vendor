import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DmcaReportStatus } from '../dto/dmca-report.dto';

@Entity('dmca_reports')
export class DmcaReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  claimantName: string;

  @Column()
  claimantEmail: string;

  @Column({ nullable: true })
  respondentEmail?: string;

  @Column()
  contentUrl: string;

  @Column()
  originalWorkUrl: string;

  @Column('text')
  description: string;

  @Column()
  isSwornStatement: boolean;

  @Column({
    type: 'enum',
    enum: DmcaReportStatus,
    default: DmcaReportStatus.PENDING
  })
  status: DmcaReportStatus;

  @Column({ nullable: true })
  adminNotes?: string;

  @Column({ nullable: true })
  assignedTo?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
