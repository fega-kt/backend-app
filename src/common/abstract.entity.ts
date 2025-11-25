import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { LanguageCode } from '../constants/language-code.ts';
import type {
  AbstractDto,
  AbstractTranslationDto,
} from './dto/abstract.dto.ts';
import type { UserEntity } from '../modules/user/user.entity';

/**
 * Abstract Entity
 * @author Narek Hakobyan <narek.hakobyan.07@gmail.com>
 *
 * @description This class is an abstract class for all entities.
 * It's experimental and recommended using it only in microservice architecture,
 * otherwise just delete and use your own entity.
 */
export abstract class AbstractEntity<
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  DTO extends AbstractDto = AbstractDto,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  O = never,
> {
  @PrimaryGeneratedColumn('uuid')
  id!: Uuid;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  deleted?: boolean;

  @ManyToOne('UserEntity', { nullable: true })
  createdBy?: UserEntity;

  @ManyToOne('UserEntity', { nullable: true })
  updatedBy?: UserEntity;

  translations?: AbstractTranslationEntity[];

  toDto(options?: O): DTO {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const dtoClass = Object.getPrototypeOf(this).dtoClass;

    if (!dtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return new dtoClass(this, options);
  }
}

export class AbstractTranslationEntity<
  DTO extends AbstractTranslationDto = AbstractTranslationDto,
  O = never,
> extends AbstractEntity<DTO, O> {
  @Column({ type: 'enum', enum: LanguageCode })
  languageCode!: LanguageCode;
}
