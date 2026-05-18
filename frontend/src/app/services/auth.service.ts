import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../core/models/user.model';

const TOKEN_KEY = 'jgg_token';
const USER_KEY = 'jgg_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly currentUserSignal = signal<AuthUser | null>(this.loadUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  register(data: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.api}/register`, data).pipe(
      tap((res) => this.setSession(res))
    );
  }

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.api}/login`, data).pipe(
      tap((res) => this.setSession(res))
    );
  }

  forgotPassword(data: { email: string; password: string; confirmPassword: string }) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.api}/forgot-password`,
      data
    );
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  loadProfile() {
    const token = this.getToken();
    if (!token) return of(null);

    return this.http.get<{ success: boolean; user: AuthUser }>(`${this.api}/profile`).pipe(
      tap((res) => {
        this.currentUserSignal.set(res.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUserSignal.set(res.user);
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
