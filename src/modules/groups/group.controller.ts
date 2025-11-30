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
import { presign } from '../../interceptors/presign.decorator.ts';
import { CreateGroupDto } from './dto/create-group.dto.ts';
import { GroupPageOptionsDto } from './dto/group-page-options.dto.ts';
import type { GroupDto } from './dto/group.dto.ts';
import { UpdateGroupDto } from './dto/update-group.dto.ts';
import { GroupService } from './group.service.ts';

@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    const entity = await this.groupService.createGroup(createGroupDto);

    return entity.toDto();
  }

  @Get()
  @presign()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  getGroups(
    @Query() groupPageOptionsDto: GroupPageOptionsDto,
  ): Promise<PageDto<GroupDto>> {
    return this.groupService.getGroups(groupPageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  async getGroup(@UUIDParam('id') id: Uuid): Promise<GroupDto> {
    const entity = await this.groupService.getGroup(id);

    return entity.toDto();
  }

  @Put(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  updateGroup(
    @UUIDParam('id') id: Uuid,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<void> {
    return this.groupService.updateGroup(id, updateGroupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteGroup(@UUIDParam('id') id: Uuid): Promise<void> {
    await this.groupService.deleteGroup(id);
  }
}
