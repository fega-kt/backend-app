import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateDepartmentHandler } from './commands/create-department.handler.ts';
import { DepartmentController } from './department.controller.ts';
import { DepartmentEntity } from './department.entity.ts';
import { DepartmentService } from './department.service.ts';

const handlers = [CreateDepartmentHandler];

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity])],
  controllers: [DepartmentController],
  exports: [DepartmentService],
  providers: [DepartmentService, ...handlers],
})
export class DepartmentModule {}
