import { BadRequestException } from '@nestjs/common';

export class UserDisableException extends BadRequestException {
  constructor(error?: string) {
    super('User is disable', error);
  }
}
