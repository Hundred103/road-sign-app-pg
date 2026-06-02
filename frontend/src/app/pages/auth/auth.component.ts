import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  loading = false;
  errorMessage = '';

  loginData = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: '',
    displayName: ''
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.errorMessage = '';
  }

  onLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.getPolishErrorMessage(error, 'Logowanie nie powiodło się');
      }
    });
  }

  onRegister(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.getPolishErrorMessage(error, 'Rejestracja nie powiodła się');
      }
    });
  }

  private getPolishErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    const backendMessage = this.extractBackendMessage(error);
    if (!backendMessage) {
      return fallbackMessage;
    }

    const normalized = backendMessage.toLowerCase().trim();

    if (normalized.includes('email already exists')) {
      return 'Ten adres e-mail jest już zajęty';
    }

    if (normalized.includes('username already exists')) {
      return 'Ta nazwa użytkownika jest już zajęta';
    }

    if (normalized.includes('username or email already exists')) {
      return 'Nazwa użytkownika lub e-mail są już zajęte';
    }

    if (normalized.includes('invalid username or password')) {
      return 'Nieprawidłowa nazwa użytkownika lub hasło';
    }

    if (normalized.includes('invalid request body')) {
      return 'Nieprawidłowe dane formularza';
    }

    if (normalized.includes('unexpected server error')) {
      return 'Wystąpił nieoczekiwany błąd serwera';
    }

    if (normalized.includes('email') && normalized.includes('well-formed')) {
      return 'Podaj poprawny adres e-mail';
    }

    if (normalized.includes('password') && normalized.includes('size')) {
      return 'Hasło musi mieć od 6 do 100 znaków';
    }

    if (normalized.includes('username') && normalized.includes('size')) {
      return 'Nazwa użytkownika musi mieć od 3 do 50 znaków';
    }

    return backendMessage;
  }

  private extractBackendMessage(error: HttpErrorResponse): string | null {
    const payload = error.error;

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      return payload.message ?? payload.detail ?? null;
    }

    return null;
  }
}
