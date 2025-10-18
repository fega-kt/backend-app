/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, ForbiddenException } from '@nestjs/common';
import type { UserEntity } from '../modules/user/user.entity';

export function AuthUser() {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (user?.[Symbol.for('isPublic')]) {
      return;
    }

    if (!user.isActive) {
      throw new ForbiddenException('User account is disabled');
    }

    return user as UserEntity;
  })();
}
