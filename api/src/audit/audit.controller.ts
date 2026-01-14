import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/auth';
import { Role } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/data';
import { AuditService } from './audit.service';

@Controller('audit-log')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  list() {
    return this.audit.list();
  }
}
