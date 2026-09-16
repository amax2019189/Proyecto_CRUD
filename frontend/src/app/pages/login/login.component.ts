import { Component, inject } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { finalize } from 'rxjs';

import { AuthLayoutComponent } from '../../shared/components/auth-layout/auth-layout.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  readonly loginForm =
    this.formBuilder.nonNullable.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
        ],
      ],
    });

  isSubmitting = false;
  showPassword = false;
  errorMessage = '';

  readonly successMessage =
    this.route.snapshot.queryParamMap.has(
      'registered'
    )
      ? 'Cuenta creada correctamente. Ya puedes iniciar sesión.'
      : '';

  submit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          const returnUrl =
            this.route.snapshot.queryParamMap.get(
              'returnUrl'
            ) ?? '/home';

          this.router.navigateByUrl(returnUrl);
        },

        error: (error) => {
          if (error.status === 0) {
            this.errorMessage =
              'No se pudo conectar con el backend.';
            return;
          }

          this.errorMessage =
            error.error?.message ??
            'No se pudo iniciar sesión.';
        },
      });
  }
}