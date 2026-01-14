import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;

  const tasksServiceMock = {
    findById: jest.fn(),
    updateTask: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    listAccessible: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksServiceMock }],
    }).compile();

    controller = moduleRef.get(TasksController);
    jest.clearAllMocks();
  });

  it('PUT /tasks/:id throws NotFound when task missing', async () => {
    tasksServiceMock.findById.mockResolvedValue(null);

    const req: any = { user: { role: 'Admin', orgId: 1, sub: 1 }, ip: 'x', method: 'PUT', originalUrl: '/tasks/1' };

    await expect(controller.updateTask('1', { title: 'x' } as any, req)).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('PUT /tasks/:id throws Forbidden when org scope mismatch (Admin)', async () => {
    tasksServiceMock.findById.mockResolvedValue({ id: 1, organizationId: 999 });

    const req: any = { user: { role: 'Admin', orgId: 1, sub: 1 }, ip: 'x', method: 'PUT', originalUrl: '/tasks/1' };

    await expect(controller.updateTask('1', { title: 'x' } as any, req)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it('PUT /tasks/:id calls service update when permitted', async () => {
    tasksServiceMock.findById.mockResolvedValue({ id: 1, organizationId: 1 });
    tasksServiceMock.updateTask.mockResolvedValue({ id: 1, title: 'updated' });

    const req: any = { user: { role: 'Admin', orgId: 1, sub: 1 }, ip: 'x', method: 'PUT', originalUrl: '/tasks/1' };

    const res = await controller.updateTask('1', { title: 'updated' } as any, req);

    expect(tasksServiceMock.updateTask).toHaveBeenCalledWith(1, { title: 'updated' });
    expect(res.title).toBe('updated');
  });
});
