import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { Router } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { finalize } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-product',
  styleUrl: './product.component.css',
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit{
  private readonly authService = inject(AuthService)
  private readonly formBuilder = inject(FormBuilder)
  private readonly productsService = inject(ProductsService)
  private readonly router = inject(Router)

  readonly currentUser = this.authService.currentUser;
  readonly productFrom = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]]
  });

  products: Product[] = [];
  editingProductId: number | null = null;
  deletingProductId: number | null = null;
  isLoading = true;
  isSubmiting = false;
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

    if (this.productFrom.invalid) {
      this.productFrom.markAllAsTouched();
      return;
    }

    const product = this.productFrom.getRawValue();
    const request = this.editingProductId === null 
      ? this.productsService.postProduct(product) 
      : this.productsService.putProduct(this.editingProductId, product);
    const successMessage = this.editingProductId === null
      ? 'Producto creado correctamente.'
      : 'Producto actualizado correctamente.';
    this.isSubmiting = true;
    request
      .pipe(finalize(() => (this.isSubmiting = false)))
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.formMessage = successMessage;
          this.loadProducts();
        },
      error: (error) => {
        this.formMessage = this.getErrorMessage(
          error,
          'No se puede guardar el producto.'
        );
      },
    });
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.formMessage = '';
    this.productFrom.setValue({
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
    });
  }

  cancelEdit(): void {
    this.editingProductId = null;
    this.productFrom.reset({ nombre: '', precio: 0, stock: 0 });
  }

  deleteProduct(product: Product): void {
    const confirmed = window.confirm(`¿Deseas eliminar el producto "${product.nombre}"?`);

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
            'No se puede eliminar el producto.'
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
      return 'No se puedo conectar con el backend.'
    }

    return error.error?.message ?? fallback;
  }
}