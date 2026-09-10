import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto, LoginPasswordDto } from './dto/auth.dto';
import { RoleType, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const formattedPhone = dto.phoneNumber.trim();
    // Default test OTP for development or fixed demo: '123456'
    const otpCode = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.oTPVerification.create({
      data: {
        phoneNumber: formattedPhone,
        otpCode,
        expiresAt,
      },
    });

    return {
      success: true,
      message: 'OTP sent successfully to ' + formattedPhone,
      // Provide OTP in dev mode for seamless testing
      devOtpHint: otpCode,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phoneNumber, otpCode, fullName, email, role } = dto;

    const record = await this.prisma.oTPVerification.findFirst({
      where: {
        phoneNumber,
        otpCode,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Accept 123456 as master OTP in development
    if (!record && otpCode !== '123456') {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (record) {
      await this.prisma.oTPVerification.update({
        where: { id: record.id },
        data: { isUsed: true },
      });
    }

    let user = await this.prisma.user.findUnique({
      where: { phoneNumber },
      include: { customerProfile: true, beauticianProfile: true },
    });

    const targetRole = (role as RoleType) || RoleType.CUSTOMER;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber,
          fullName: fullName || 'BeautyNest Guest',
          email: email || null,
          role: targetRole,
          gender: Gender.FEMALE,
          customerProfile: targetRole === RoleType.CUSTOMER ? {
            create: {
              referralCode: 'BN' + Math.floor(100000 + Math.random() * 900000),
              city: 'Lucknow',
              wallet: { create: { balance: 100.0 } },
            },
          } : undefined,
          beauticianProfile: targetRole === RoleType.BEAUTICIAN ? {
            create: {
              baseCity: 'Lucknow',
              experienceYears: 2,
              rating: 5.0,
            },
          } : undefined,
        },
        include: { customerProfile: true, beauticianProfile: true },
      });
    }

    const tokens = this.generateTokens(user);
    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        customerProfile: user.customerProfile,
        beauticianProfile: user.beauticianProfile,
      },
      ...tokens,
    };
  }

  async loginWithPassword(dto: LoginPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { phoneNumber: dto.identifier }],
      },
      include: { customerProfile: true, beauticianProfile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'beautynest_refresh_secret_key_2026',
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User no longer exists');

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, role: user.role, phone: user.phoneNumber };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'beautynest_super_secret_jwt_token_2026_spa_ladies',
      expiresIn: process.env.JWT_EXPIRATION || '7d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'beautynest_refresh_secret_key_2026',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
    });

    return { accessToken, refreshToken };
  }
}
