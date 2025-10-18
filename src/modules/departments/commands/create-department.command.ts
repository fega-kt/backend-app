import type { ICommand } from '@nestjs/cqrs';

import type { CreateDepartmentDto } from '../dto/create-department.dto.ts';

export class CreateDepartmentCommand implements ICommand {
  constructor(public readonly createDepartmentDto: CreateDepartmentDto) {}
}
