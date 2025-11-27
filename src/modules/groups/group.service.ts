import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, type Repository } from 'typeorm';

import type { PageDto } from '../../common/dto/page.dto.ts';
import { CreateGroupCommand } from './commands/create-group.command.ts';
import type { GroupDto } from './dto/group.dto.ts';
import type { GroupPageOptionsDto } from './dto/group-page-options.dto.ts';
import { GroupNotFoundException } from './exceptions/group-not-found.exception.ts';
import { GroupEntity } from './group.entity.ts';
import { CreateGroupDto } from './dto/create-group.dto.ts';
import type { UpdateGroupDto } from './dto/update-group.dto.ts';

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
      .orderBy('groups.updatedAt', 'DESC');

    const [items, pageMetaDto] =
      await queryBuilder.paginate(groupPageOptionsDto);

    // eslint-disable-next-line sonarjs/argument-type
    return items.toPageDto(pageMetaDto);
  }

  async getGroup(id: Uuid): Promise<GroupEntity> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('groups')
      .where('groups.id = :id', { id });

    const entity = await queryBuilder.getOne();

    if (!entity) {
      throw new GroupNotFoundException();
    }

    return entity;
  }

  async updateGroup(id: Uuid, updateGroupDto: UpdateGroupDto): Promise<void> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('groups')
      .where('groups.id = :id', { id });

    const entity = await queryBuilder.getOne();

    if (!entity) {
      throw new GroupNotFoundException();
    }

    this.groupRepository.merge(entity, updateGroupDto);

    await this.groupRepository.save(updateGroupDto);
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
