import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import type { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../common/dto/page.dto.ts';
import { FolderAWS } from '../../constants/folder.ts';
import { FileNotImageException } from '../../exceptions/file-not-image.exception.ts';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception.ts';
import type { IFile } from '../../interfaces/IFile.ts';
import { AwsS3Service } from '../../shared/services/aws-s3.service.ts';
import { ValidatorService } from '../../shared/services/validator.service.ts';
import type { Reference } from '../../types.ts';
import { urlJoin } from '../../utils/url-join.ts';
import { UserRegisterDto } from '../auth/dto/user-register.dto.ts';
import { CreateSettingsCommand } from './commands/create-settings.command.ts';
import { CreateSettingsDto } from './dtos/create-settings.dto.ts';
import type { UpdateUserDto } from './dtos/update-user.dto.ts';
import type { UserDto } from './dtos/user.dto.ts';
import type { UsersPageOptionsDto } from './dtos/users-page-options.dto.ts';
import type { UserSettingsEntity } from './user-settings.entity.ts';
import { UserEntity } from './user.entity.ts';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private validatorService: ValidatorService,
    private awsS3Service: AwsS3Service,
    private commandBus: CommandBus,
  ) {}

  /**
   * Find single user
   */
  findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOneBy(findData);
  }

  findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | null> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect<UserEntity, 'user'>('user.settings', 'settings');

    if (options.email) {
      queryBuilder.orWhere('user.email = :email', {
        email: options.email,
      });
    }

    if (options.username) {
      queryBuilder.orWhere('user.username = :username', {
        username: options.username,
      });
    }

    return queryBuilder.getOne();
  }

  @Transactional()
  async createUser(
    userRegisterDto: UserRegisterDto,
    file?: Reference<IFile>,
  ): Promise<UserEntity> {
    const user = this.userRepository.create(userRegisterDto);

    if (file && !this.validatorService.isImage(file.mimetype)) {
      throw new FileNotImageException();
    }

    if (file) {
      user.avatar = await this.awsS3Service.uploadImage(
        file,
        urlJoin(FolderAWS.AVATAR, user.id),
      );
    }

    await this.userRepository.save(user);

    user.settings = await this.createSettings(
      user.id,
      plainToClass(CreateSettingsDto, {
        isEmailVerified: false,
        isPhoneVerified: false,
      }),
    );

    return user;
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.department', 'department')
      .addSelect(['department.id', 'department.name', 'department.code'])
      .where('user.deleted != :deleted', { deleted: true })
      .orderBy('user.updatedAt', 'DESC');

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
    const data = await Promise.all(
      items.map(async (it) => {
        const avatar = it.avatar
          ? await this.awsS3Service.getPresignedUrl(it.avatar)
          : '';

        it.avatar = avatar;

        return it;
      }),
    );

    // eslint-disable-next-line sonarjs/argument-type
    return data.toPageDto(pageMetaDto);
  }

  async getUser(userId: Uuid): Promise<UserDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.id = :userId', { userId });

    const userEntity = await queryBuilder.getOne();

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity.toDto();
  }

  createSettings(
    userId: Uuid,
    createSettingsDto: CreateSettingsDto,
  ): Promise<UserSettingsEntity> {
    return this.commandBus.execute<CreateSettingsCommand, UserSettingsEntity>(
      new CreateSettingsCommand(userId, createSettingsDto),
    );
  }

  @Transactional()
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Reference<IFile>,
  ): Promise<UserDto> {
    const user = await this.findOne({ id: id as never });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Gán các trường từ DTO
    Object.assign(user, updateUserDto);

    // Validate file
    if (file && !this.validatorService.isImage(file.mimetype)) {
      throw new FileNotImageException();
    }

    // Upload ảnh nếu có
    if (file) {
      user.avatar = await this.awsS3Service.uploadImage(
        file,
        urlJoin(FolderAWS.AVATAR, user.id),
      );
    }

    await this.userRepository.save(user);

    return this.getAvatarPresignedUrl(user);
  }

  async getAvatarPresignedUrl(user: UserEntity): Promise<UserDto> {
    if (user.avatar) {
      user.avatar = await this.awsS3Service.getPresignedUrl(user.avatar);
    }

    return user.toDto();
  }
}
