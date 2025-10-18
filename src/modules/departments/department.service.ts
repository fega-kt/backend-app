import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../common/dto/page.dto.ts';
import { CreateDepartmentCommand } from './commands/create-department.command.ts';
import { DepartmentEntity } from './department.entity.ts';
import { CreateDepartmentDto } from './dto/create-department.dto.ts';
import type { DepartmentPageOptionsDto } from './dto/department-page-options.dto.ts';
import type { DepartmentDto } from './dto/department.dto.ts';
import type { UpdateDepartmentDto } from './dto/update-department.dto.ts';
import { DepartmentNotFoundException } from './exceptions/department-not-found.exception.ts';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private departmentRepository: Repository<DepartmentEntity>,
    private commandBus: CommandBus,
  ) {}

  @Transactional()
  createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentEntity> {
    return this.commandBus.execute<CreateDepartmentCommand, DepartmentEntity>(
      new CreateDepartmentCommand(createDepartmentDto),
    );
  }

  async getDepartments(
    departmentPageOptionsDto: DepartmentPageOptionsDto,
  ): Promise<PageDto<DepartmentDto>> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('departments')
      .leftJoinAndSelect('departments.translations', 'departmentsTranslation');
    const [items, pageMetaDto] = await queryBuilder.paginate(
      departmentPageOptionsDto,
    );

    // eslint-disable-next-line sonarjs/argument-type
    return items.toPageDto(pageMetaDto);
  }

  async getDepartment(id: Uuid): Promise<DepartmentEntity> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('departments')
      .where('departments.id = :id', { id });

    const entity = await queryBuilder.getOne();

    if (!entity) {
      throw new DepartmentNotFoundException();
    }

    return entity;
  }

  async updateDepartment(
    id: Uuid,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<void> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('departments')
      .where('departments.id = :id', { id });

    const entity = await queryBuilder.getOne();

    if (!entity) {
      throw new DepartmentNotFoundException();
    }

    this.departmentRepository.merge(entity, updateDepartmentDto);

    await this.departmentRepository.save(updateDepartmentDto);
  }

  async deleteDepartment(id: Uuid): Promise<void> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('departments')
      .where('departments.id = :id', { id });

    const entity = await queryBuilder.getOne();

    if (!entity) {
      throw new DepartmentNotFoundException();
    }

    await this.departmentRepository.remove(entity);
  }
}
