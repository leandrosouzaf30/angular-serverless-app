import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-xl font-bold">Task List</h1>
        <button routerLink="/tasks/new" class="bg-blue-500 text-white px-4 py-2 rounded">
          Add Task
        </button>
      </div>

      <div *ngIf="loading" class="text-center p-4">Loading...</div>
      
      <div *ngIf="error" class="bg-red-100 text-red-700 p-4 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="!loading && tasks.length === 0" class="text-center p-4">
        No tasks found. Add a new task to get started!
      </div>

      <div *ngIf="tasks.length > 0" class="grid gap-4">
        <div *ngFor="let task of tasks" class="border p-4 rounded shadow-sm">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                [checked]="task.completed"
                (change)="toggleStatus(task)"
                class="form-checkbox h-5 w-5"
              >
              <span [ngClass]="{'line-through': task.completed}">{{ task.title }}</span>
            </div>
            <div class="flex gap-2">
              <button (click)="editTask(task)" class="text-blue-500">Edit</button>
              <button (click)="deleteTask(task.id)" class="text-red-500">Delete</button>
            </div>
          </div>
          <p *ngIf="task.description" class="mt-2 text-gray-600">{{ task.description }}</p>
        </div>
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  error = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleStatus(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe({
      next: () => {
        task.completed = !task.completed;
      },
      error: (err) => {
        this.error = 'Failed to update task status.';
        console.error(err);
      }
    });
  }

  editTask(task: Task): void {
    // Navegar programaticamente ou com o router
    window.location.href = `/tasks/${task.id}/edit`;
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete task.';
          console.error(err);
        }
      });
    }
  }
}