import { SetMetadata } from '@nestjs/common';
import { Role } from '@stms/data';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
