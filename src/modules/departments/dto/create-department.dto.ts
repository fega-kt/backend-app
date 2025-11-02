import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CodeField } from '../../../decorators/field.decorators';

export class CreateDepartmentDto {
  @CodeField()
  code!: string;

  @IsString()
  name!: string;

  // 🔹 ID của phòng ban cha
  @IsOptional()
  @IsUUID()
  parent?: string | null;

  // 🔹 ID của trưởng phòng
  @IsOptional()
  @IsUUID()
  manager?: string;

  // 🔹 ID của phó phòng
  @IsOptional()
  @IsUUID()
  deputy?: string;
}
