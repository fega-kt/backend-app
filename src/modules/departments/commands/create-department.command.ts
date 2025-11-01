import type { ICommand } from '@nestjs/cqrs';

import type { Repository } from 'typeorm';
import type { DepartmentEntity } from '../department.entity.ts';
import type { CreateDepartmentDto } from '../dto/create-department.dto.ts';

export class CreateDepartmentCommand implements ICommand {
  constructor(
    public readonly createDepartmentDto: CreateDepartmentDto,
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {}

  async execute(command: CreateDepartmentCommand): Promise<DepartmentEntity> {
    const { createDepartmentDto } = command;
    console.info('jsndjvn');
    // Tạo entity
    const department = this.departmentRepository.create(
      createDepartmentDto as DepartmentEntity,
    );

    // Lưu lần đầu để có id
    await this.departmentRepository.save(department);

    // Cập nhật path chính xác
    const newPath = department.parent
      ? `${department.parent.path}/${department.id}`
      : `/${department.id}`;
    department.path = newPath;

    await this.departmentRepository.save(department);

    return department;
  }
}
