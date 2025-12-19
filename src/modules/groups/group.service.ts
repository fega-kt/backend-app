import { ConflictException, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, type Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { UserEntity } from 'modules/user/user.entity.ts';
import type { PageDto } from '../../common/dto/page.dto.ts';
import { CreateGroupCommand } from './commands/create-group.command.ts';
import { CreateGroupDto } from './dto/create-group.dto.ts';
import type { GroupPageOptionsDto } from './dto/group-page-options.dto.ts';
import type { GroupDto } from './dto/group.dto.ts';
import type { UpdateGroupDto } from './dto/update-group.dto.ts';
import { GroupNotFoundException } from './exceptions/group-not-found.exception.ts';
import { GroupEntity } from './group.entity.ts';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,
    private commandBus: CommandBus,
  ) {}

  @Transactional()
  createGroup(createGroupDto: CreateGroupDto): Promise<GroupEntity> {
    return this.commandBus.execute<CreateGroupCommand, GroupEntity>(
      new CreateGroupCommand(createGroupDto),
    );
  }

  async getGroups(
    groupPageOptionsDto: GroupPageOptionsDto,
  ): Promise<PageDto<GroupDto>> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('groups')
      .where('groups.deleted != :deleted', { deleted: true })
      .leftJoin('groups.users', 'users')
      .addSelect(['users.id', 'users.fullName', 'users.email', 'users.avatar'])
      .orderBy('groups.updatedAt', 'DESC');

    const [items, pageMetaDto] =
      await queryBuilder.paginate(groupPageOptionsDto);

    // eslint-disable-next-line sonarjs/argument-type
    return items.toPageDto(pageMetaDto);
  }

  async getGroup(id: Uuid): Promise<GroupEntity> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('groups')
      .where('groups.id = :id', { id })
      .leftJoin('groups.users', 'users')
      .addSelect(['users.id', 'users.fullName', 'users.avatar']);

    const entity = await queryBuilder.getOne();

    if (!entity) {
      throw new GroupNotFoundException();
    }

    return entity;
  }

  async updateGroup(id: Uuid, updateGroupDto: UpdateGroupDto): Promise<void> {
    const entity = await this.groupRepository.findOne({
      where: { id, deleted: Not(true) },
    });

    if (!entity) {
      throw new GroupNotFoundException();
    }

    if (updateGroupDto.code !== entity.code) {
      const existed = await this.groupRepository.findOne({
        where: { code: updateGroupDto.code },
        select: ['id'],
      });

      if (existed) {
        throw new ConflictException(
          `Group code "${updateGroupDto.code}" already exists`,
        );
      }
    }

    this.groupRepository.merge(entity, {
      name: updateGroupDto.name,
      code: updateGroupDto.code,
      permissions: updateGroupDto.permissions ?? [],
    });

    if (updateGroupDto.users) {
      entity.users = updateGroupDto.users.map((userId) => ({
        id: userId,
      })) as UserEntity[];
    }

    await this.groupRepository.save(entity);
  }

  @Transactional()
  async deleteGroup(id: Uuid): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id, deleted: Not(true) },
    });

    if (!group) {
      throw new GroupNotFoundException();
    }

    await this.groupRepository
      .createQueryBuilder()
      .delete()
      .from('group_users')
      .where('group_id = :id', { id })
      .execute();

    // 3. Soft delete group → set deleted = true
    await this.groupRepository.update(id, {
      deleted: true,
    });
  }
}
