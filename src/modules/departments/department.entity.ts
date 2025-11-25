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
  parent?: DepartmentEntity | null;

  // 🔹 Danh sách phòng ban con
  @OneToMany(() => DepartmentEntity, (department) => department.parent)
  children?: DepartmentEntity[];

  @OneToMany('UserEntity', (user: UserEntity) => user.department)
  users?: UserEntity[];

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  manager?: UserEntity | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  deputy?: UserEntity | null;
}
