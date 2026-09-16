import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductData, ProductResponse, ProductsResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/products`; // Ruta absoluta

    getProducts(): Observable<ProductsResponse> {
        return this.http.get<ProductsResponse>(`${this.apiUrl}/get`); // Ruta especifica
    }

    getProduct(id: number): Observable<ProductResponse> {
        return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`) // Ruta especifica
    }

    postProduct(product: ProductData): Observable<ProductResponse> {
        return this.http.post<ProductResponse>(`${this.apiUrl}/post`, product) // Ruta especifica con su estructura o cuerpo
    }

    putProduct(id: number, product: ProductData): Observable<ProductResponse> {
        return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, product) // Ruta especifica para editar por medio de su ID
    }

    deleteProduct(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string}>(`${this.apiUrl}/${id}`) // Ruta especifica para eliminar por medio de su ID
    }
}