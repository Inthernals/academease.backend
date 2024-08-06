import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from '../enums/roles.enum';

export class QueryUsersDto {
  @IsString()
  @IsOptional()
  pgNum?: string;

  @IsString()
  @IsOptional()
  pgSize?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  fullname?: string;

  @IsEnum(Roles)
  @IsOptional()
  role?: Roles;

  @IsOptional()
  @IsString()
  onlyDeleted?: 'true' | 'false';
}
