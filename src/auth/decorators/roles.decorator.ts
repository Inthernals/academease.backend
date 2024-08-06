import { SetMetadata } from '@nestjs/common';
import { Roles as RolesEnum } from '../../users/enums/roles.enum';

export const ROLE_KEY = 'role';

export const Roles = (...role: RolesEnum[]) => SetMetadata(ROLE_KEY, role);
