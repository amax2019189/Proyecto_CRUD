export interface Product {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    created_at: string;
}

export interface ProductData {
    nombre: string;
    precio: number;
    stock: number;
}

export interface ProductResponse {
    product: Product
}

export interface ProductsResponse {
    products: Product[];
}