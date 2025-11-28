import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { UserEntity } from '../user/user.entity.ts';
import { GroupDto, type IGroupDtoOptions } from './dto/group.dto.ts';

export enum Permission {
  ADD_USER = 'ADD_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ADD_GROUP = 'ADD_GROUP',
  UPDATE_GROUP = 'UPDATE_GROUP',
  DELETE_GROUP = 'DELETE_GROUP',
  ADD_DEPARTMENT = 'ADD_DEPARTMENT',
  UPDATE_DEPARTMENT = 'UPDATE_DEPARTMENT',
  DELETE_DEPARTMENT = 'DELETE_DEPARTMENT',
}

@Entity({ name: 'groups' })
@UseDto(GroupDto)
export class GroupEntity extends AbstractEntity<GroupDto, IGroupDtoOptions> {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  code!: string;

  @ManyToMany(() => UserEntity, (user) => user.groups)
  @JoinTable({
    name: 'group_users', // tên bảng join mong muốn
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users!: UserEntity[];

  @Column({
    type: 'enum',
    enum: Permission,
    array: true,
    default: [],
  })
  permissions!: Permission[];
}
