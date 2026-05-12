import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { catchError, of } from 'rxjs';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AsyncPipe, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Znaki Drogowe';
  readonly currentUser$ = this.authService.currentUser$;

  constructor(private readonly authService: AuthService) {
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

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
