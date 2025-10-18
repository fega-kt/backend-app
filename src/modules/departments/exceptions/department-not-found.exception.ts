import { NotFoundException } from '@nestjs/common';

export class DepartmentNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.DepartmentNotFoundException', error);
  }
}
