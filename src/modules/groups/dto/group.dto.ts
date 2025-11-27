import { AbstractDto } from '../../../common/dto/abstract.dto';
import {
  ArrayFieldString,
  CodeField,
  StringField,
} from '../../../decorators/field.decorators';
import type { GroupEntity, Permission } from '../group.entity';

export interface IGroupDtoOptions {}

export class GroupDto extends AbstractDto {
  @StringField()
  name!: string;

  @CodeField()
  code!: string;

  @ArrayFieldString()
  permissions: Permission[];

  constructor(group: GroupEntity) {
    super(group);
    this.name = group.name;
    this.code = group.code;
    this.permissions = group.permissions;
  }
}
