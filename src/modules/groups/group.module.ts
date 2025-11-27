import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateGroupHandler } from './commands/create-group.handler.ts';
import { GroupController } from './group.controller.ts';
import { GroupEntity } from './group.entity.ts';
import { GroupService } from './group.service.ts';

const handlers = [CreateGroupHandler];

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  providers: [GroupService, ...handlers],
  controllers: [GroupController],
})
export class GroupModule {}
