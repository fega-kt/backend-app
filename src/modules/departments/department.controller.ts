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

import type { PageDto } from '../../common/dto/page.dto';
import { CreateDepartmentDto } from './dto/create-department.dto.ts';
import type { DepartmentDto } from './dto/department.dto.ts';
import { DepartmentPageOptionsDto } from './dto/department-page-options.dto.ts';
import { UpdateDepartmentDto } from './dto/update-department.dto.ts';
import { DepartmentService } from './department.service.ts';
import { Auth, UUIDParam } from '../../decorators/http.decorators.ts';

@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Post()
  @Auth([])
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    const entity =
      await this.departmentService.createDepartment(createDepartmentDto);

    return entity.toDto();
  }

  @Get()
  @Auth([])
  @HttpCode(HttpStatus.OK)
  getDepartments(
    @Query() departmentPageOptionsDto: DepartmentPageOptionsDto,
  ): Promise<PageDto<DepartmentDto>> {
    return this.departmentService.getDepartments(departmentPageOptionsDto);
  }

  @Get(':id')
  @Auth([])
  @HttpCode(HttpStatus.OK)
  async getDepartment(@UUIDParam('id') id: Uuid): Promise<DepartmentDto> {
    const entity = await this.departmentService.getDepartment(id);

    return entity.toDto();
  }

  @Put(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  updateDepartment(
    @UUIDParam('id') id: Uuid,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<void> {
    return this.departmentService.updateDepartment(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteDepartment(@UUIDParam('id') id: Uuid): Promise<void> {
    await this.departmentService.deleteDepartment(id);
  }
}
