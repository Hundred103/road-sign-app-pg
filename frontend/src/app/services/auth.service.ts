import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/register`, payload, { withCredentials: true }).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  login(payload: LoginPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, payload, { withCredentials: true }).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  loadSession(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/session`, { withCredentials: true }).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }

  clearSessionState(): void {
    this.currentUserSubject.next(null);
  }
}
