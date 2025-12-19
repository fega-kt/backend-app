import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { RoleType } from '../../constants/role-type.ts';
import { TokenType } from '../../constants/token-type.ts';
import { ApiConfigService } from '../../shared/services/api-config.service.ts';
import type { UserEntity } from '../user/user.entity.ts';
import { UserService } from '../user/user.service.ts';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ApiConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.publicKey,
    });
  }

  async validate(args: {
    userId: Uuid;
    role: RoleType;
    type: TokenType;
  }): Promise<UserEntity> {
    if (args.type !== TokenType.ACCESS_TOKEN) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(
      {
        // FIXME: issue with type casts
        id: args.userId as never,
        role: args.role,
      },
      {
        relations: {
          department: {
            manager: true,
          },
          groups: true,
        },
        select: {
          id: true,
          fullName: true,
          role: true,
          email: true,
          isActive: true,
          avatar: true,
          firstName: true,
          lastName: true,
          groups: true,
          department: {
            id: true,
            name: true,
            code: true,
            manager: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      },
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
