import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from '../enums/roles.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  fullname?: string;

  @IsEnum(Roles)
  @IsOptional()
  role?: Roles;

  @IsString()
  @IsOptional()
  photo?: string;
}
