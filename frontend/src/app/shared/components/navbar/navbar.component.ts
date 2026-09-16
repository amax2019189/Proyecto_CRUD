import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})

export class NavbarComponent {
  @Input() user: User | null = null;

  @Output() logout = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }
}