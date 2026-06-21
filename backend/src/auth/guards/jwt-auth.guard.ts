import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization as string | undefined;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token JWT requis.');
    }

    const user = await this.authService.resolveUserFromBearer(authorization);
    if (!user) {
      throw new UnauthorizedException('Token JWT invalide ou expiré.');
    }

    request.user = user;
    return true;
  }
}
