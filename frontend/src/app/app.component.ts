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
  mobileNavOpen = false;

  constructor(private readonly authService: AuthService, private readonly router: Router) {
    // Hydrate UI from storage quickly, then attempt server validation
    this.authService.initFromStorage();
    this.authService
      .loadSession()
      .pipe(
        catchError(() => {
          this.authService.clearSessionState();
          return of(null);
        })
      )
      .subscribe({ next: (u) => console.log('[DEBUG] loadSession result', u) });
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
    if (this.mobileNavOpen) {
      this.userMenuOpen = false;
    }
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
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
    this.mobileNavOpen = false;
    this.authService.logout().subscribe(() => {
      // Force a full reload so the app state (cookies/session) is fully reset
      window.location.href = '/';
    });
  }
}
