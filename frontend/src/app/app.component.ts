import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AsyncPipe, NgIf, CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AsyncPipe, NgIf, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Znaki Drogowe';
  readonly currentUser$ = this.authService.currentUser$;
  userMenuOpen = false;

  constructor(private readonly authService: AuthService, private readonly router: Router) {
    this.authService
      .loadSession()
      .pipe(
        catchError(() => {
          this.authService.clearSessionState();
          return of(null);
        })
      )
      .subscribe();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  openQuizTab(): void {
    this.userMenuOpen = false;
    this.router.navigate(['/quiz'], {
      queryParams: {
        tab: 'list',
        t: Date.now()
      }
    });
  }

  onLogout(): void {
    this.userMenuOpen = false;
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
