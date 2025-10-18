import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { UserEntity } from '../user/user.entity.ts';
import {
  DepartmentDto,
  type IDepartmentDtoOptions,
} from './dto/department.dto.ts';

@Entity({ name: 'departments' })
@UseDto(DepartmentDto)
export class DepartmentEntity extends AbstractEntity<
  DepartmentDto,
  IDepartmentDtoOptions
> {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  code!: string;

  @Column({ type: 'varchar' })
  path!: string;

  @OneToMany(() => UserEntity, (user) => user.department)
  users?: UserEntity[];
}
