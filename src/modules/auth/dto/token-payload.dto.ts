import { StringField } from '../../../decorators/field.decorators.ts';

export class TokenPayloadDto {
  @StringField()
  refreshToken: string;

  @StringField()
  accessToken: string;

  constructor(data: { refreshToken: string; accessToken: string }) {
    this.refreshToken = data.refreshToken;
    this.accessToken = data.accessToken;
  }
}
