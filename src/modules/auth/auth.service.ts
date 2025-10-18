import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { validateHash } from '../../common/utils.ts';
import type { RoleType } from '../../constants/role-type.ts';
import { TokenType } from '../../constants/token-type.ts';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception.ts';
import { ApiConfigService } from '../../shared/services/api-config.service.ts';
import type { UserEntity } from '../user/user.entity.ts';
import { UserService } from '../user/user.service.ts';
import { TokenPayloadDto } from './dto/token-payload.dto.ts';
import type { UserLoginDto } from './dto/user-login.dto.ts';

@Injectable()
export class AuthService {
  configService: ApiConfigService;

  constructor(
    apiConfigService: ApiConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    this.configService = apiConfigService;
  }

  async createAccessToken(data: {
    role: RoleType;
    userId: Uuid;
  }): Promise<TokenPayloadDto> {
    const [accessToken, { refreshToken }] = await Promise.all([
      this.jwtService.signAsync({
        userId: data.userId,
        type: TokenType.ACCESS_TOKEN,
        role: data.role,
      }),

      this.createRefreshToken(data.userId, data.role),
    ]);

    return new TokenPayloadDto({
      refreshToken,
      accessToken,
    });
  }

  async createRefreshToken(
    userId: string,
    role: RoleType,
  ): Promise<{ refreshToken: string; expiresIn: string }> {
    const expiresIn = this.configService.authConfig.jwtRefreshExpirationTime;
    const refreshToken = await this.jwtService.signAsync(
      { userId, type: TokenType.ACCESS_TOKEN, role },
      {
        expiresIn,
        algorithm: 'RS256',
        privateKey: this.configService.authConfig.privateKey,
      },
    );

    return { refreshToken, expiresIn };
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userService.findOne({
      email: userLoginDto.email,
    });

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user?.password,
    );

    if (!isPasswordValid) {
      throw new UserNotFoundException();
    }

    if (!user?.isActive) {
      throw new ForbiddenException('User account is disabled');
    }

    return user;
  }

  async validateRefreshToken(
    token: string,
  ): Promise<{ userId: string; role: RoleType }> {
    try {
      const decoded: { userId: string; role: RoleType } =
        await this.jwtService.verifyAsync(token, {
          algorithms: ['RS256'],
          publicKey: this.configService.authConfig.publicKey,
        });

      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
