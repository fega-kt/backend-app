import {
  ClassField,
  StringField,
} from '../../../decorators/field.decorators.ts';
import { UserDto } from '../../user/dtos/user.dto.ts';
import { TokenPayloadDto } from './token-payload.dto.ts';

export class LoginPayloadDto {
  @ClassField(() => UserDto)
  user: UserDto;

  @StringField()
  accessToken: string;

  @StringField()
  refreshToken: string;

  constructor(user: UserDto, token: TokenPayloadDto) {
    this.user = user;
    this.accessToken = token.accessToken;
    this.refreshToken = token.refreshToken;
  }
}
