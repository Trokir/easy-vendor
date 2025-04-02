import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Добавляем дополнительную логику, если необходимо
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Можно добавить кастомную логику обработки ошибок
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized access');
    }
    return user;
  }
}
