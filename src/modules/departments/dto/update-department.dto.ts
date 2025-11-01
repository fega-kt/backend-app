import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  // 🔹 ID của phòng ban cha
  @IsOptional()
  @IsUUID()
  parent?: string;

  // 🔹 ID của trưởng phòng
  @IsOptional()
  @IsUUID()
  manager?: string;

  // 🔹 ID của phó phòng
  @IsOptional()
  @IsUUID()
  deputy?: string;
}
