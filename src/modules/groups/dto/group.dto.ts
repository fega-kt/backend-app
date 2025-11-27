import { AbstractDto } from '../../../common/dto/abstract.dto';
import { CodeField, StringField } from '../../../decorators/field.decorators';
import type { GroupEntity } from '../group.entity';

export interface IGroupDtoOptions {}

export class GroupDto extends AbstractDto {
  @StringField()
  name!: string;

  @CodeField()
  code!: string;

  constructor(group: GroupEntity) {
    super(group);
    this.name = group.name;
    this.code = group.code;
  }
}
