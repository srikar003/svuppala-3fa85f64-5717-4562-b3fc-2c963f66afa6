import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { TasksService, Task } from '../services/tasks.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './insights.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Insights implements OnInit {
  loading = false;
  error = '';
  userRole = '';
  isViewer = false;

  tasks: Task[] = [];

  constructor(
    private auth: AuthService,
    private tasksService: TasksService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const info = this.auth.getUserInfo();
    this.userRole = info.role || '';
    this.isViewer = this.userRole === 'Viewer';

    this.refresh();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  refresh() {
    this.loading = true;
    this.error = '';

    this.tasksService
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (list) => {
          this.tasks = list || [];
        },
        error: (e) => {
          this.error = e?.error?.message || 'Failed to load tasks';
        },
      });
  }

  get totalCount(): number {
    return this.tasks.length;
  }

  get todoCount(): number {
    return this.tasks.filter((t) => t.status === 'Todo').length;
  }

  get inProgressCount(): number {
    return this.tasks.filter((t) => t.status === 'InProgress').length;
  }

  get doneCount(): number {
    return this.tasks.filter((t) => t.status === 'Done').length;
  }

  get completionPct(): number {
    const total = this.totalCount;
    if (!total) return 0;
    return Math.round((this.doneCount / total) * 100);
  }

  // category breakdown (top 6)
  get categoryCounts(): { category: string; count: number }[] {
    const map = new Map<string, number>();
    for (const t of this.tasks) {
      const key = (t.category || 'Uncategorized').trim() || 'Uncategorized';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }
}
