import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { AuthService } from '../services/auth.service';
import { TasksService, Task, TaskStatus } from '../services/tasks.service';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './task-dashboard.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TaskDashboard implements OnInit, OnDestroy {
  loading = false;
  error = '';

  // role state
  userRole = '';
  isViewer = false;

  // filters
  categoryFilter = '';
  statusFilter: '' | TaskStatus = '';

  // create form
  newTitle = '';
  newCategory = '';
  newDescription = '';

  // board columns
  todo: Task[] = [];
  inProgress: Task[] = [];
  done: Task[] = [];

  //edit state
  editing: Task | null = null;
  editTitle = '';
  editCategory = '';
  editDescription = '';
  savingEdit = false;

  //sorting
  sortBy: 'order' | 'title' | 'category' = 'order';


  private sub?: Subscription;

  constructor(
    private tasks: TasksService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    let initialized = false;
    let lastRole = '';

    this.sub = this.auth.authState$.subscribe((info) => {
      const role = info.role || '';
      this.userRole = role;
      this.isViewer = role === 'Viewer';
      this.error = '';

      // ✅ only refresh on first init or when the ROLE changes
      if (!initialized || role !== lastRole) {
        initialized = true;
        lastRole = role;
        this.refresh();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  refresh() {
    this.error = '';
    this.cdr.detectChanges();

    this.tasks
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (list) => {
          const filtered = this.applyFilters(list);

          const todo = filtered.filter(t => t.status === 'Todo');
          const inProg = filtered.filter(t => t.status === 'InProgress');
          const done = filtered.filter(t => t.status === 'Done');

          this.todo = this.sortList(todo);
          this.inProgress = this.sortList(inProg);
          this.done = this.sortList(done);
        },
        error: (e) => {
          this.error = e?.error?.message || 'Failed to load tasks';
        },
      });
  }

  applyFilters(list: Task[]) {
    return list.filter((t) => {
      const catOk =
        !this.categoryFilter || t.category.toLowerCase().includes(this.categoryFilter.toLowerCase());
      const statusOk = !this.statusFilter || t.status === this.statusFilter;
      return catOk && statusOk;
    });
  }

  applyFiltersAndRefresh() {
    this.refresh();
  }

  clearFilters() {
    this.categoryFilter = '';
    this.statusFilter = '';
    this.refresh();
  }

  createTask() {
    if (this.isViewer) return; // extra safety
    if (!this.newTitle.trim()) return;

    this.tasks
      .create({
        title: this.newTitle.trim(),
        category: (this.newCategory || 'General').trim(),
        description: this.newDescription,
        status: 'Todo',
      })
      .subscribe({
        next: () => {
          this.newTitle = '';
          this.newDescription = '';
          this.newCategory = '';
          this.refresh();
        },
        error: (e) => (this.error = e?.error?.message || 'Create failed'),
      });
  }

  deleteTask(t: Task) {
    if (this.isViewer) return; // extra safety

    this.tasks.remove(t.id).subscribe({
      next: () => this.refresh(),
      error: (e) => (this.error = e?.error?.message || 'Delete failed'),
    });
  }

  // Drag/drop only for non-viewer; HTML already disables it, this is extra safety
  drop(status: TaskStatus, event: CdkDragDrop<Task[]>) {
    if (this.isViewer) return;

    if (this.sortBy !== 'order') {
      this.error = 'Reordering is disabled while sorting by Title/Category. Switch Sort to "Board Order".';
      return;
    }

    // Same-column reorder
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // replace refs for render
      this.todo = [...this.todo];
      this.inProgress = [...this.inProgress];
      this.done = [...this.done];

      // persist orders
      this.persistOrders(event.container.data);
      return;
    }

    // Cross-column move
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const moved = event.container.data[event.currentIndex];
    moved.status = status; // ✅ update UI model immediately

    this.todo = [...this.todo];
    this.inProgress = [...this.inProgress];
    this.done = [...this.done];
    this.cdr.detectChanges(); // ✅ ensures header counts update instantly

    // Persist status; if it fails, refresh to revert UI to server truth
    this.tasks.update(moved.id, { status }).subscribe({
      next: () => this.persistOrders(event.container.data),
      error: (e) => {
        this.error = e?.error?.message || 'Update failed';
        this.refresh(); // revert to server truth
      },
    });
  }

  openEdit(t: Task) {
    if (this.isViewer) return;
    this.editing = t;
    this.editTitle = t.title;
    this.editCategory = t.category;
    this.editDescription = t.description || '';
  }

  closeEdit() {
    this.editing = null;
    this.savingEdit = false;
    this.cdr.detectChanges();
  }

  saveEdit() {
    if (!this.editing || this.isViewer || this.savingEdit) return;

    this.savingEdit = true;
    const id = this.editing.id;

    this.tasks.update(id, {
      title: this.editTitle.trim(),
      category: this.editCategory.trim(),
      description: this.editDescription,
    }).subscribe({
      next: () => {
        this.closeEdit();    // ✅ closes + forces UI update
        this.refresh();      // reload from server
      },
      error: (e) => {
        this.savingEdit = false;
        this.error = e?.error?.message || 'Update failed';
        this.cdr.detectChanges();
      },
    });
  }

  private persistOrders(list: Task[]) {
    list.forEach((t, idx) => {
      if (t.order !== idx) {
        t.order = idx;
        this.tasks.update(t.id, { order: idx }).subscribe({
          error: () => {
            // If order update fails for any reason, fall back to server truth
            this.refresh();
          },
        });
      }
    });
  }

  private sortList(list: Task[]): Task[] {
    const copy = [...list];

    if (this.sortBy === 'order') {
      return copy.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    if (this.sortBy === 'title') {
      return copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    // category
    return copy.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
  }
}
