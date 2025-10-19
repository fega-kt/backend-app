import { AbstractDto } from '../../../common/dto/abstract.dto';
import { StringField } from '../../../decorators/field.decorators';
import type { UserEntity } from '../../../modules/user/user.entity';
import type { DepartmentEntity } from '../department.entity';

export interface IDepartmentDtoOptions {}

export class DepartmentDto extends AbstractDto {
  @StringField()
  name!: string;

  @StringField()
  code!: string;

  @StringField()
  path!: string;

  users?: UserEntity[];

  parent?: DepartmentEntity;

  children?: DepartmentEntity[];

  manager?: UserEntity;

  deputy?: UserEntity;

  constructor(department: DepartmentEntity, options?: IDepartmentDtoOptions) {
    console.info(options);
    super(department);
    this.name = department.name;
    this.code = department.code;
    this.path = department.path;
    this.users = department.users;
    this.parent = department.parent;
    this.children = department.children;
    this.manager = department.manager;
    this.deputy = department.deputy;
  }
}
