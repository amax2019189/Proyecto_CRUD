export interface User {
    id: number;
    nombre: string;
    email: string;
    created_at?: string;
    iat?: number; // Tiempo de creación del token
    exp?: number; // Tiempo de expiración del token
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    nombre: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterResponse {
    user: User;
}

export interface UserResponse {
    user: User;
}

export interface UsersResponse {
    users: User[];
}

// Esta información representa la información que se esta enviando y recibiendo del backend