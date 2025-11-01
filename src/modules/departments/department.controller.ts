import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { RoleType } from 'constants/role-type.ts';
import type { PageDto } from '../../common/dto/page.dto';
import { Auth, UUIDParam } from '../../decorators/http.decorators.ts';
import type { DepartmentEntity } from './department.entity.ts';
import { DepartmentService } from './department.service.ts';
import { CreateDepartmentDto } from './dto/create-department.dto.ts';
import { DepartmentPageOptionsDto } from './dto/department-page-options.dto.ts';
import type { DepartmentDto } from './dto/department.dto.ts';
import { UpdateDepartmentDto } from './dto/update-department.dto.ts';

@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    const entity =
      await this.departmentService.createDepartment(createDepartmentDto);

    return entity.toDto();
  }

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  getDepartments(
    @Query() departmentPageOptionsDto: DepartmentPageOptionsDto,
  ): Promise<PageDto<DepartmentDto>> {
    return this.departmentService.getDepartments(departmentPageOptionsDto);
  }

  @Get('tree')
  @Auth()
  @HttpCode(HttpStatus.OK)
  getDepartmentsForBuildTree(): Promise<DepartmentEntity[]> {
    return this.departmentService.getDepartmentsForTree();
  }

  @Get(':id')
  @Auth([])
  @HttpCode(HttpStatus.OK)
  async getDepartment(@UUIDParam('id') id: Uuid): Promise<DepartmentDto> {
    const entity = await this.departmentService.getDepartment(id);

    return entity.toDto();
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.ADMIN])
  updateDepartment(
    @UUIDParam('id') id: Uuid,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<void> {
    return this.departmentService.updateDepartment(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteDepartment(@UUIDParam('id') id: Uuid): Promise<void> {
    await this.departmentService.deleteDepartment(id);
  }
}
