import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@stms/auth';
import { Role } from '@stms/data';
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
