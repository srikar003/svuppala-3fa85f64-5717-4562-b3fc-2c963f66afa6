import { Routes } from '@angular/router';
import { Login } from './login/login';
import { TaskDashboard } from './task-dashboard/task-dashboard';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'tasks', component: TaskDashboard, canActivate: [authGuard] },
];
