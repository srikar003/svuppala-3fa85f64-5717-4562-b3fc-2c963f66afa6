import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/auth';
import { CreateTaskInput, Role, UpdateTaskInput } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/data';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(private tasks: TasksService) { }

  @Get()
  list(@Req() req: any) {
    return this.tasks.list(req.user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  create(@Req() req: any, @Body() body: CreateTaskInput) {
    return this.tasks.create(req.user, body);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: Request) {
    const user: any = (req as any).user;
    const taskId = Number(id);

    const task = await this.tasks.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // ✅ org scoping: Admin can only edit tasks in their org
    // Owner rule depends on your design:
    // - simplest: Owner also limited to their org (change if you implemented parent-child access)
    const userOrgId = user?.orgId;
    const role = user?.role;

    const canAccess =
      role === 'Owner'
        ? this.tasks.ownerCanAccessOrg(user, task.organizationId) // implement OR simplify below
        : task.organizationId === userOrgId;

    if (!canAccess) throw new ForbiddenException('Not permitted');

    return this.tasks.updateTask(taskId, dto);

  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.tasks.remove(req.user, Number(id));
  }
}
