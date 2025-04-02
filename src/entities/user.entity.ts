import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { LegalConsent } from './legal-consent.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  role: string;

  @OneToMany(() => Vendor, vendor => vendor.user)
  vendors: Vendor[];

  @OneToMany(() => LegalConsent, consent => consent.user)
  consents: LegalConsent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
