import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { RegisterDto } from '../dtos/register.dto';
import { LegalConsent } from '../entities/legal-consent.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(LegalConsent)
    private legalConsentRepository: Repository<LegalConsent>
  ) {}

  async register(dto: RegisterDto, ip: string): Promise<{ id: number }> {
    // Check terms acceptance
    if (!dto.acceptedTerms) {
      throw new ForbiddenException('Terms of Service must be accepted');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Create user
    const user = await this.userRepository.save({
      email: dto.email,
      passwordHash,
      role: 'vendor'
    });

    // Create vendor
    await this.vendorRepository.save({
      userId: user.id,
      businessName: dto.businessName,
      domain: dto.domain,
      templateType: 'default',
      config: {}
    });

    // Record legal consent
    await this.legalConsentRepository.save({
      userId: user.id,
      documentType: 'terms',
      ip
    });

    return { id: user.id };
  }
} 