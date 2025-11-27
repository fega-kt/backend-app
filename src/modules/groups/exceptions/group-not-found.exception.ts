import { NotFoundException } from '@nestjs/common';

export class GroupNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.GroupNotFoundException', error);
  }
}
