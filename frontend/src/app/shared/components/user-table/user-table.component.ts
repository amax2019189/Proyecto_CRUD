import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css',
})

export class UserTableComponent {
  @Input() users: User[] = [];
  @Input() loading = false;
  @Input() errorMessage = '';

  @Output() retry = new EventEmitter<void>();

  searchTerm = '';

  get filteredUsers(): User[] {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return this.users;
    }

    return this.users.filter((user) => {
      return (
        user.nombre.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    });
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  onRetry(): void {
    this.retry.emit();
  }
}