import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h1>
      
      <div *ngIf="error" class="bg-red-100 text-red-700 p-4 rounded mb-4">
        {{ error }}
      </div>

      <form (ngSubmit)="onSubmit()" #taskForm="ngForm">
        <div class="mb-4">
          <label for="title" class="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            [(ngModel)]="task.title"
            required
            class="w-full p-2 border rounded"
          >
        </div>

        <div class="mb-4">
          <label for="description" class="block mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            [(ngModel)]="task.description"
            rows="3"
            class="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div class="mb-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              name="completed"
              [(ngModel)]="task.completed"
              class="mr-2"
            >
            <span>Completed</span>
          </label>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            [disabled]="!taskForm.form.valid || loading"
            class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {{ loading ? 'Saving...' : 'Save Task' }}
          </button>
          <button
            type="button"
            (click)="cancel()"
            class="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  task: Partial<Task> = {
    title: '',
    description: '',
    completed: false
  };
  isEditing = false;
  loading = false;
  error = '';

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.isEditing = true;
      this.loadTask(taskId);
    }
  }

  loadTask(id: string): void {
    this.loading = true;
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load task details.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    if (this.isEditing && this.task.id) {
      this.taskService.updateTask(this.task.id, this.task).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.error = 'Failed to update task.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.taskService.createTask(this.task as Omit<Task, 'id'>).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.error = 'Failed to create task.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}