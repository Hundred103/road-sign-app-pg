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

  // Hydrate from localStorage so UI remains logged-in across reloads even if server cookie
  // handling needs investigation. This is a UX fallback and does not replace server session.
  initFromStorage(): void {
    try {
      const raw = localStorage.getItem('rs-current-user');
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        this.currentUserSubject.next(parsed);
        console.log('[DEBUG] AuthService: hydrated user from localStorage', parsed.username);
      }
    } catch (e) {
      console.warn('[DEBUG] AuthService: failed to hydrate user from storage', e);
    }
  }

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/register`, payload, { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        try { localStorage.setItem('rs-current-user', JSON.stringify(user)); } catch {}
      })
    );
  }

  login(payload: LoginPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, payload, { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        try { localStorage.setItem('rs-current-user', JSON.stringify(user)); } catch {}
      })
    );
  }

  loadSession(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/session`, { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        try { localStorage.setItem('rs-current-user', JSON.stringify(user)); } catch {}
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        try { localStorage.removeItem('rs-current-user'); } catch {}
      })
    );
  }

  clearSessionState(): void {
    this.currentUserSubject.next(null);
  }
}
