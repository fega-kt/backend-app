import { StringField } from '../../../decorators/field.decorators.ts';

export class CreateGroupDto {
  @StringField()
  title!: string;
}
