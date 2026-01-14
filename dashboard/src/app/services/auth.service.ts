import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

type UserInfo = { role?: string; orgId?: number; userId?: number };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwt_token';

  // ✅ emits current auth state (token/user)
  private authStateSubject = new BehaviorSubject<UserInfo>(this.getUserInfo());
  authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<{ accessToken: string }>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.accessToken);
          this.authStateSubject.next(this.getUserInfo()); // ✅ broadcast new role
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.authStateSubject.next({}); // ✅ broadcast logged out
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserInfo(): UserInfo {
    const token = this.getToken();
    if (!token) return {};

    const parts = token.split('.');
    if (parts.length !== 3) return {};

    try {
      const payload = JSON.parse(atob(parts[1]));
      return {
        role: payload.role,
        orgId: payload.orgId,
        userId: payload.sub ?? payload.userId,
      };
    } catch {
      return {};
    }
  }
}
