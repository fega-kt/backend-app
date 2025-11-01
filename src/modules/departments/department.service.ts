import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Not, type Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../common/dto/page.dto.ts';
import { AwsS3Service } from '../../shared/services/aws-s3.service.ts';
import { UserService } from '../user/user.service.ts';
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
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  @Transactional()
  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const {
      parent: parentId,
      code,
      manager,
      deputy,
      name,
    } = createDepartmentDto;

    // Tìm root hiện có (nếu tạo root)
    const existingRoot = await this.departmentRepository.findOneBy({
      parent: IsNull(),
    });

    if (!parentId && existingRoot) {
      throw new BadRequestException('Only one root department is allowed');
    }

    // Kiểm tra trùng code
    const duplicateCode = await this.departmentRepository.findOneBy({ code });

    if (duplicateCode) {
      throw new BadRequestException('Department code already exists');
    }

    const dataCreate: Partial<DepartmentEntity> = { code, name };

    // Nếu có parent
    if (parentId) {
      const parentEntity = await this.departmentRepository.findOneBy({
        id: parentId as never,
      });

      if (!parentEntity) {
        throw new BadRequestException('Parent department not found');
      }

      dataCreate.parent = parentEntity;

      // Path mới
      dataCreate.path = `${parentEntity.path}/`;
    } else {
      // Root
      dataCreate.path = ''; // sẽ add /id sau insert
    }

    // Manager & deputy
    if (manager) {
      dataCreate.manager =
        (await this.userService.findOne({ id: manager as never })) ?? undefined;
    }

    if (deputy) {
      dataCreate.deputy =
        (await this.userService.findOne({ id: deputy as never })) ?? undefined;
    }

    // Thực hiện tạo entity
    // const entity = await this.commandBus.execute<
    //   CreateDepartmentCommand,
    //   DepartmentEntity
    // >(
    //   new CreateDepartmentCommand(
    //     createDepartmentDto,
    //     this.departmentRepository,
    //   ),
    // );

    // Tạo entity mới
    let department = this.departmentRepository.create(dataCreate);

    // Lưu lần đầu để có id
    department = await this.departmentRepository.save(department);

    // Cập nhật path chính xác với id vừa tạo
    department.path = department.parent
      ? `${department.parent.path}/${department.id}`
      : `/${department.id}`;

    // Lưu lại entity với path mới
    department = await this.departmentRepository.save(department);

    return department;
  }

  async getDepartments(
    departmentPageOptionsDto: DepartmentPageOptionsDto,
  ): Promise<PageDto<DepartmentDto>> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('departments')
      .leftJoinAndMapOne(
        'departments.manager',
        'departments.manager',
        'manager',
        'manager.id IS NOT NULL',
      )
      .leftJoinAndMapOne(
        'departments.deputy',
        'departments.deputy',
        'deputy',
        'deputy.id IS NOT NULL',
      )

      .addSelect([
        'deputy.id',
        'deputy.fullName',
        'deputy.avatar',
        'manager.id',
        'manager.fullName',
        'manager.avatar',
      ])
      .where('departments.deleted != :deleted', { deleted: true })
      .orderBy('departments.updatedAt', 'ASC');

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
      .createQueryBuilder('department')
      .where('department.id = :id', { id })
      .leftJoin('department.parent', 'parent')
      .leftJoinAndMapOne(
        'department.manager',
        'department.manager',
        'manager',
        'manager.id IS NOT NULL',
      )
      .leftJoinAndMapOne(
        'department.deputy',
        'department.deputy',
        'deputy',
        'deputy.id IS NOT NULL',
      )
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
      .addSelect('deputy.fullName')
      .addSelect('parent');

    const department = await queryBuilder.getOne();

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
    const dataUpdate: Partial<DepartmentEntity> = {
      parent: null,
      manager: null,
      deputy: null,
      code: updateDepartmentDto.code,
    };

    const code = dataUpdate.code;
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('departments')
      .where('departments.id = :id', { id });

    const queryBuilderDuplicateCode = this.departmentRepository
      .createQueryBuilder('departments')
      .where('departments.code = :code', { code })
      .andWhere('departments.id != :id', { id });

    const [entity, duplicateCode, existingRoot] = await Promise.all([
      queryBuilder.getOne(),
      queryBuilderDuplicateCode.getOne(),
      this.departmentRepository.findOneBy({
        parent: IsNull(),
        id: Not(id),
      }),
    ]);

    if (existingRoot && !updateDepartmentDto.parent) {
      throw new BadRequestException('Only one root department is allowed');
    }

    if (duplicateCode) {
      throw new BadRequestException('Department code already exists');
    }

    if (!entity) {
      throw new DepartmentNotFoundException();
    }

    if (id === updateDepartmentDto.parent) {
      throw new BadRequestException('Parent cannot be itself');
    }

    if (updateDepartmentDto.parent) {
      const newParent = await this.departmentRepository.findOneBy({
        id: updateDepartmentDto.parent as never,
      });

      if (!newParent) {
        throw new BadRequestException('Parent department not found');
      }

      // Check if new parent is a child of the current department
      // Assuming entity.path is like '/parentId/currentId/...'
      if (newParent.path.startsWith(entity.path)) {
        throw new BadRequestException(
          'Cannot set a child department as parent',
        );
      }

      dataUpdate.parent = newParent;
    }

    if (updateDepartmentDto.manager) {
      dataUpdate.manager =
        (await this.userService.findOne({
          id: updateDepartmentDto.manager as never,
        })) ?? undefined;
    }

    if (updateDepartmentDto.deputy) {
      dataUpdate.deputy =
        (await this.userService.findOne({
          id: updateDepartmentDto.deputy as never,
        })) ?? undefined;
    }

    dataUpdate.name = updateDepartmentDto.name;

    // --- Nếu có đổi parent thì phải đổi path ---

    const newParent = dataUpdate.parent;
    const newParentPath = newParent?.path ?? '';
    const oldPath = entity.path;

    // path mới cho phòng ban hiện tại
    const newPath = `${newParentPath}/${entity.id}`;
    dataUpdate.path = newPath;

    await this.departmentRepository.update(id, dataUpdate);

    // cập nhật toàn bộ con cháu của nó
    await this.updateChildrenPath(oldPath, newPath);
  }

  /**
   * Cập nhật path của tất cả phòng ban con khi parent đổi
   */
  private async updateChildrenPath(oldParentPath: string, parentPath: string) {
    const children = await this.departmentRepository.find({
      where: { path: Like(`${oldParentPath}/%`) },
    });

    await Promise.all(
      children.map((child) => {
        const path = child.path.replace(oldParentPath, parentPath);

        return this.departmentRepository.update(child.id, { path });
      }),
    );
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

  async getDepartmentsForTree(): Promise<DepartmentEntity[]> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .where('department.deleted != :deleted', { deleted: true })
      .leftJoin('department.parent', 'parent')
      .addSelect(['parent'])
      .orderBy('department.updatedAt', 'DESC');

    const items = await queryBuilder.getMany();

    return items;
  }
}
