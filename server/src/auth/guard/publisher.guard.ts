import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from 'src/user/schemas/user.schema';

type ReqUser = { userId: string; role?: UserRole };

@Injectable()
export class PublisherGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: ReqUser }>();
    const role = req.user?.role;
    if (role !== 'publisher') {
      throw new ForbiddenException('Доступно только издателям');
    }
    return true;
  }
}
