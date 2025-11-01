import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../user/user.entity.ts';
import { UserService } from '../user/user.service.ts';
import { CreateDepartmentHandler } from './commands/create-department.handler.ts';
import { DepartmentController } from './department.controller.ts';
import { DepartmentEntity } from './department.entity.ts';

import { DepartmentService } from './department.service.ts';

const handlers = [CreateDepartmentHandler];

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity, UserEntity])],
  controllers: [DepartmentController],
  exports: [DepartmentService, UserService],
  providers: [DepartmentService, ...handlers, UserService],
})
export class DepartmentModule {}
