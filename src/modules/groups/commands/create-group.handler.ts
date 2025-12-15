import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConflictException } from '@nestjs/common';
import { GroupEntity } from '../group.entity.ts';
import { CreateGroupCommand } from './create-group.command.ts';

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler
  implements ICommandHandler<CreateGroupCommand, GroupEntity>
{
  constructor(
    @InjectRepository(GroupEntity)
    private groupEntityRepository: Repository<GroupEntity>,
  ) {}

  async execute(command: CreateGroupCommand) {
    const { createGroupDto } = command;

    const existed = await this.groupEntityRepository.findOne({
      where: { code: createGroupDto.code },
      select: ['id'], // nhẹ query
    });

    if (existed) {
      throw new ConflictException(
        `Group code "${createGroupDto.code}" already exists`,
      );
    }

    const groupEntity = this.groupEntityRepository.create({
      name: createGroupDto.name,
      code: createGroupDto.code,
      permissions: createGroupDto.permissions ?? [],

      users: createGroupDto.users?.map((userId) => ({
        id: userId,
      })),
    });

    return this.groupEntityRepository.save(groupEntity);
  }
}
