import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Organization } from '../entities/organization.entity';
import { CreateTaskInput, Role, UpdateTaskInput, JwtUser } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/data';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepo: Repository<Task>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>
  ) { }

  private async writeAudit(userId: number, action: string, resource: string, resourceId?: number, details?: any) {
    await this.auditRepo.save(
      this.auditRepo.create({
        userId,
        action,
        resource,
        resourceId: resourceId ?? null,
        details: details ? JSON.stringify(details) : '',
      })
    );
    console.log(`[AUDIT] user=${userId} action=${action} resource=${resource} id=${resourceId ?? ''}`);
  }

  // Org scope: Admin/Viewer -> own org only. Owner -> own org + direct children (2-level hierarchy).
  private async getScopedOrgIds(user: JwtUser): Promise<number[]> {
    if (user.role !== Role.OWNER) return [user.orgId];

    const children = await this.orgRepo.find({ where: { parentOrgId: user.orgId } });
    return [user.orgId, ...children.map((c) => c.id)];
  }

  async list(user: JwtUser) {
    const orgIds = await this.getScopedOrgIds(user);
    const tasks = await this.tasksRepo.find({
      where: { organizationId: In(orgIds) },
      order: { order: 'ASC', updatedAt: 'DESC' as any },
    });

    await this.writeAudit(user.userId, 'LIST', 'Task', undefined, { orgIds, count: tasks.length });
    return tasks;
  }

  async create(user: JwtUser, input: CreateTaskInput) {
    if (user.role === Role.VIEWER) throw new ForbiddenException('Viewer cannot create tasks');

    const task = this.tasksRepo.create({
      title: input.title,
      description: input.description ?? '',
      category: input.category,
      status: input.status ?? 'Todo',
      order: 0,
      organizationId: user.orgId,
      createdBy: user.userId,
    });

    const saved = await this.tasksRepo.save(task);
    await this.writeAudit(user.userId, 'CREATE', 'Task', saved.id, { title: saved.title });
    return saved;
  }

  async update(user: JwtUser, id: number, input: UpdateTaskInput) {
    if (user.role === Role.VIEWER) throw new ForbiddenException('Viewer cannot edit tasks');

    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const orgIds = await this.getScopedOrgIds(user);
    if (!orgIds.includes(task.organizationId)) throw new ForbiddenException('No access to this task');

    Object.assign(task, input);
    const saved = await this.tasksRepo.save(task);
    await this.writeAudit(user.userId, 'UPDATE', 'Task', saved.id, input);
    return saved;
  }

  async remove(user: JwtUser, id: number) {
    if (user.role === Role.VIEWER) throw new ForbiddenException('Viewer cannot delete tasks');

    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const orgIds = await this.getScopedOrgIds(user);
    if (!orgIds.includes(task.organizationId)) throw new ForbiddenException('No access to this task');

    await this.tasksRepo.delete(id);
    await this.writeAudit(user.userId, 'DELETE', 'Task', id);
    return { ok: true };
  }

  async findById(id: number) {
    return this.tasksRepo.findOne({ where: { id } });
  }

  async updateTask(id: number, dto: UpdateTaskDto) {
    await this.tasksRepo.update({ id }, dto);
    return this.findById(id);
  }

  // Optional helper if you have hierarchy
  ownerCanAccessOrg(user: any, taskOrgId: number) {
    // If you already have parent/child org logic elsewhere, reuse it.
    // Minimal default (same org only):
    return taskOrgId === user.orgId;
  }
}
