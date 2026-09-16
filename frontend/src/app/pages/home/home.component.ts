import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { User } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { UserTableComponent } from '../../shared/components/user-table/user-table.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    UserTableComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})

export class HomeComponent implements OnInit {
  private readonly authService =
    inject(AuthService);

  private readonly usersService =
    inject(UsersService);

  private readonly router =
    inject(Router);

  readonly currentUser =
    this.authService.currentUser;

  users: User[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      profile:
        this.usersService.getProfile(),

      users:
        this.usersService.getUsers(),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: ({
          profile,
          users,
        }) => {
          this.authService.updateCurrentUser(
            profile.user
          );

          this.users = users.users;
        },

        error: (error) => {
          if (error.status === 0) {
            this.errorMessage =
              'No se pudo conectar con el backend.';
            return;
          }

          this.errorMessage =
            error.error?.message ??
            'No fue posible cargar los usuarios.';
        },
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}