import { CreateTranslationDto } from '../../../common/dto/create-translation.dto.ts';
import { TranslationsField } from '../../../decorators/field.decorators.ts';

import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  // 🔹 Tiêu đề đa ngôn ngữ
  @TranslationsField({ type: CreateTranslationDto })
  title!: CreateTranslationDto[];

  // 🔹 Mô tả đa ngôn ngữ
  @TranslationsField({ type: CreateTranslationDto })
  description!: CreateTranslationDto[];

  // 🔹 Tên phòng ban (bắt buộc)
  @IsString()
  name!: string;

  // 🔹 Mã phòng ban (bắt buộc, duy nhất)
  @IsString()
  code!: string;

  // 🔹 Đường dẫn phòng ban (bắt buộc, duy nhất)
  @IsString()
  path!: string;

  // 🔹 ID phòng ban cha (nullable)
  @IsOptional()
  @IsUUID()
  parentId?: string;

  // 🔹 ID trưởng phòng (nullable)
  @IsOptional()
  @IsUUID()
  managerId?: string;

  // 🔹 ID phó phòng (nullable)
  @IsOptional()
  @IsUUID()
  deputyId?: string;
}
