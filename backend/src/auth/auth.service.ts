import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { isLegacyAuthAllowed } from '../config/jwt-secret.validation';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RequestUser } from './decorators/current-user.decorator';
import { toAuthUserResponse } from './mappers/user.mapper';
import { AuthUserResponse, LoginResponse } from './types/auth-user.response';
import { JwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Adresse e-mail ou mot de passe incorrect.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Adresse e-mail ou mot de passe incorrect.');
    }

    const publicUser = toAuthUserResponse(user);
    const token = this.signToken(publicUser);

    return { token, user: publicUser };
  }

  async getProfile(userId: string): Promise<AuthUserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur inconnu ou inactif.');
    }

    return toAuthUserResponse(user);
  }

  async resolveRequestUser(request: Request): Promise<RequestUser | null> {
    const bearerUser = await this.resolveUserFromBearer(
      request.headers.authorization,
    );
    if (bearerUser) {
      return bearerUser;
    }

    if (!isLegacyAuthAllowed(process.env.NODE_ENV)) {
      return null;
    }

    const userId = request.header('x-user-id');
    const userEmail = request.header('x-user-email');

    if (!userId && !userEmail) {
      return null;
    }

    const user = userId
      ? await this.prisma.user.findUnique({
          where: { id: userId },
          include: { role: true },
        })
      : await this.prisma.user.findUnique({
          where: { email: userEmail!.toLowerCase() },
          include: { role: true },
        });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };
  }

  async resolveUserFromBearer(
    authorization?: string,
  ): Promise<RequestUser | null> {
    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.slice(7);
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role.name,
      };
    } catch {
      return null;
    }
  }

  private signToken(user: AuthUserResponse): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
