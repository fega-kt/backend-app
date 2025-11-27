import type { ICommand } from '@nestjs/cqrs';

import type { CreateGroupDto } from '../dto/create-group.dto.ts';

export class CreateGroupCommand implements ICommand {
  constructor(
    public readonly createGroupDto: CreateGroupDto,
) {}
}
