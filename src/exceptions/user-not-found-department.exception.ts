import { BadRequestException } from '@nestjs/common';

export class UserNotFoundDepartmentException extends BadRequestException {
  constructor(error?: string) {
    super('user not fount department', error);
  }
}
