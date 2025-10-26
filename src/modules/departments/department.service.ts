import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, type Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../common/dto/page.dto.ts';
import { AwsS3Service } from '../../shared/services/aws-s3.service.ts';
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
    private awsS3Service: AwsS3Service,
    private commandBus: CommandBus,
  ) {}

  @Transactional()
  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentEntity> {
    if (!createDepartmentDto.parentId) {
      const existingRoot = await this.departmentRepository.findOneBy({
        parent: IsNull(),
      });

      if (existingRoot) {
        throw new Error('Chỉ được phép có một phòng ban gốc duy nhất');
      }
    }

    return this.commandBus.execute<CreateDepartmentCommand, DepartmentEntity>(
      new CreateDepartmentCommand(createDepartmentDto),
    );
  }

  async getDepartments(
    departmentPageOptionsDto: DepartmentPageOptionsDto,
  ): Promise<PageDto<DepartmentDto>> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoin('department.deputy', 'deputy')
      .leftJoin('department.manager', 'manager')

      .addSelect([
        'deputy.id',
        'deputy.fullName',
        'deputy.avatar',
        'manager.id',
        'manager.fullName',
        'manager.avatar',
      ])
      .where('department.deleted != :deleted', { deleted: true })
      .orderBy('department.updatedAt', 'DESC');

    const [items, pageMetaDto] = await queryBuilder.paginate(
      departmentPageOptionsDto,
    );
    const data = await Promise.all(
      items.map(async (item) => {
        const [managerAvatar, deputyAvatar] = await Promise.all([
          this.awsS3Service.getPresignedUrl(item.manager?.avatar),
          this.awsS3Service.getPresignedUrl(item.deputy?.avatar),
        ]);

        if (item.manager) {
          item.manager.avatar = managerAvatar;
        }

        if (item.deputy) {
          item.deputy.avatar = deputyAvatar;
        }

        return item;
      }),
    );

    // eslint-disable-next-line sonarjs/argument-type
    return data.toPageDto(pageMetaDto);
  }

  async getDepartment(id: Uuid): Promise<DepartmentEntity> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('departments')
      .where('departments.id = :id', { id })
      .leftJoin('departments.manager', 'manager')
      .leftJoin('departments.deputy', 'deputy')
      .addSelect([
        'manager.id',
        'manager.firstName',
        'manager.lastName',
        'manager.avatar',
      ])
      .addSelect([
        'deputy.id',
        'deputy.firstName',
        'deputy.lastName',
        'deputy.avatar',
      ])
      .addSelect('manager.fullName')
      .addSelect('deputy.fullName');

    const department = await queryBuilder.getOne();

    console.info('fullName::', department?.manager?.fullName);

    if (!department) {
      throw new DepartmentNotFoundException();
    }

    const [managerAvatar, deputyAvatar] = await Promise.all([
      this.awsS3Service.getPresignedUrl(department.manager?.avatar),
      this.awsS3Service.getPresignedUrl(department.deputy?.avatar),
    ]);

    if (department.manager) {
      department.manager.avatar = managerAvatar;
    }

    if (department.deputy) {
      department.deputy.avatar = deputyAvatar;
    }

    return department;
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
