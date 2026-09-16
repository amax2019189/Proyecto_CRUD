import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { ProductsService } from '../../core/services/products.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NavbarComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly productForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
  });

  products: Product[] = [];
  editingProductId: number | null = null;
  deletingProductId: number | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  formMessage = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productsService
      .getProducts()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.products = response.products;
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible cargar los productos.'
          );
        },
      });
  }

  submit(): void {
    this.formMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.getRawValue();
    const request = this.editingProductId === null
      ? this.productsService.createProduct(product)
      : this.productsService.updateProduct(this.editingProductId, product);
    const successMessage = this.editingProductId === null
      ? 'Producto creado correctamente.'
      : 'Producto actualizado correctamente.';

    this.isSubmitting = true;
    request
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.formMessage = successMessage;
          this.loadProducts();
        },
        error: (error) => {
          this.formMessage = this.getErrorMessage(
            error,
            'No se pudo guardar el producto.'
          );
        },
      });
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.formMessage = '';
    this.productForm.setValue({
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
    });
  }

  cancelEdit(): void {
    this.editingProductId = null;
    this.productForm.reset({ nombre: '', precio: 0, stock: 0 });
  }

  deleteProduct(product: Product): void {
    const confirmed = window.confirm(
      `¿Deseas eliminar el producto "${product.nombre}"?`
    );

    if (!confirmed) {
      return;
    }

    this.deletingProductId = product.id;
    this.formMessage = '';
    this.productsService
      .deleteProduct(product.id)
      .pipe(finalize(() => (this.deletingProductId = null)))
      .subscribe({
        next: () => {
          if (this.editingProductId === product.id) {
            this.cancelEdit();
          }
          this.formMessage = 'Producto eliminado correctamente.';
          this.loadProducts();
        },
        error: (error) => {
          this.formMessage = this.getErrorMessage(
            error,
            'No se pudo eliminar el producto.'
          );
        },
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el backend.';
    }

    return error.error?.message ?? fallback;
  }
}
