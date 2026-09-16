import { Component, inject } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import {
  Router,
  RouterLink,
} from '@angular/router';

import { finalize } from 'rxjs';

import { AuthLayoutComponent } from '../../shared/components/auth-layout/auth-layout.component';
import { AuthService } from '../../core/services/auth.service';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password =
    control.get('password')?.value;

  const confirmPassword =
    control.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    return null;
  }

  return {
    passwordsMismatch: true,
  };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})

export class RegisterComponent {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  readonly registerForm =
    this.formBuilder.nonNullable.group(
      {
        nombre: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.maxLength(120),
          ],
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
          ],
        ],

        confirmPassword: [
          '',
          [
            Validators.required,
          ],
        ],
      },
      {
        validators:
          passwordsMatchValidator,
      }
    );

  isSubmitting = false;
  showPassword = false;
  errorMessage = '';

  submit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const {
      nombre,
      email,
      password,
    } = this.registerForm.getRawValue();

    this.isSubmitting = true;

    this.authService
      .register({
        nombre,
        email,
        password,
      })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(
            ['/login'],
            {
              queryParams: {
                registered: 'true',
              },
            }
          );
        },

        error: (error) => {
          if (error.status === 0) {
            this.errorMessage =
              'No se pudo conectar con el backend.';
            return;
          }

          this.errorMessage =
            error.error?.message ??
            'No se pudo crear la cuenta.';
        },
      });
  }
}