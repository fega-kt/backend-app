import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import {
  DepartmentDto,
  type IDepartmentDtoOptions,
} from './dto/department.dto.ts';

// ⚠️ Import kiểu type-only để tránh circular dependency runtime
import type { UserEntity } from '../user/user.entity.ts';

@Entity({ name: 'departments' })
@UseDto(DepartmentDto)
export class DepartmentEntity extends AbstractEntity<
  DepartmentDto,
  IDepartmentDtoOptions
> {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  code!: string;

  @Column({ type: 'varchar', unique: true })
  path!: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent?: DepartmentEntity;

  // 🔹 Danh sách phòng ban con
  @OneToMany(() => DepartmentEntity, (department) => department.parent)
  children?: DepartmentEntity[];

  // 🔹 Danh sách user thuộc phòng ban này
  @OneToMany('UserEntity', 'department')
  users?: UserEntity[];

  // 🔹 Trưởng phòng (1 phòng có thể có 1 trưởng)
  @ManyToOne('UserEntity', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  manager?: UserEntity;

  // 🔹 Phó phòng (1 phòng có thể có 1 phó)
  @ManyToOne('UserEntity', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  deputy?: UserEntity;
}
