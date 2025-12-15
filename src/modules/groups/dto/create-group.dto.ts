import {
  ArrayFieldString,
  StringField,
} from '../../../decorators/field.decorators.ts';
import type { Permission } from '../group.entity.ts';

export class CreateGroupDto {
  @StringField()
  name!: string;

  @StringField()
  code!: string;

  @ArrayFieldString({ nullable: true, defaultValue: [] })
  permissions?: Permission[];

  @ArrayFieldString({ nullable: true, defaultValue: [] })
  users?: string[];
}
