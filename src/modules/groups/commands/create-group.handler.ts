import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupEntity } from '../group.entity.ts';
import { CreateGroupCommand } from './create-group.command.ts';

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler
  implements ICommandHandler<CreateGroupCommand, GroupEntity>
{
  constructor(
    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,
  ) {}

  async execute() {
    const entity = this.groupRepository.create();
    await this.groupRepository.save(entity);

    return entity;
  }
}
