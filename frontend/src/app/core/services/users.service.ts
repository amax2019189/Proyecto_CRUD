import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  UserResponse,
  UsersResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${environment.apiUrl}/users/me`
    );
  }

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(
      `${environment.apiUrl}/users`
    );
  }
}