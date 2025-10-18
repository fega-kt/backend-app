import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DepartmentEntity } from '../department.entity.ts';
import { CreateDepartmentCommand } from './create-department.command.ts';

@CommandHandler(CreateDepartmentCommand)
export class CreateDepartmentHandler
  implements ICommandHandler<CreateDepartmentCommand, DepartmentEntity>
{
  constructor(
    @InjectRepository(DepartmentEntity)
    private departmentRepository: Repository<DepartmentEntity>,
  ) {}

  async execute() {
    const entity = this.departmentRepository.create();

    await this.departmentRepository.save(entity);

    return entity;
  }
}
