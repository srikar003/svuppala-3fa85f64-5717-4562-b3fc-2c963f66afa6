import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type TaskStatus = 'Todo' | 'InProgress' | 'Done';

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  status: TaskStatus;
  order: number;
  organizationId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Task[]>(`${environment.apiBaseUrl}/tasks`);
  }

  create(payload: { title: string; description?: string; category: string; status?: TaskStatus }) {
    return this.http.post<Task>(`${environment.apiBaseUrl}/tasks`, payload);
  }

  update(id: number, payload: Partial<{ title: string; description: string; category: string; status: TaskStatus; order: number }>) {
    return this.http.put<Task>(`${environment.apiBaseUrl}/tasks/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<{ ok: boolean }>(`${environment.apiBaseUrl}/tasks/${id}`);
  }
}
