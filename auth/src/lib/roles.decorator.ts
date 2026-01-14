import { SetMetadata } from '@nestjs/common';
import { Role } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/data';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
