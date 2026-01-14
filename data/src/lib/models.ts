export enum Role {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  VIEWER = 'Viewer',
}

export type TaskStatus = 'Todo' | 'InProgress' | 'Done';

export interface JwtUser {
  userId: number;
  role: Role;
  orgId: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  titleased: Record<string, never>;
  title?: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
  order?: number;
}
