import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignService, RoadSign, TileViewStatus } from '../../services/sign.service';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent implements OnInit {
  private signService = inject(SignService);
  private authService = inject(AuthService);

  signs: RoadSign[] = [];
  filteredSigns: RoadSign[] = [];
  selectedCategory = 'ALL';
  selectedSign: RoadSign | null = null;
  isLoading = true;
  isLoggedIn = false;
  currentUserId: number | null = null;
  private tileViewMap = new Map<number, string>();

  categories = [
    { value: 'ALL', label: 'Wszystkie' },
    { value: 'WARNING', label: 'Ostrzegawcze' },
    { value: 'PROHIBITION', label: 'Zakazu' },
    { value: 'MANDATORY', label: 'Nakazu' },
    { value: 'INFORMATION', label: 'Informacyjne' },
    { value: 'PRIORITY', label: 'Pierwszenstwa' }
  ];

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: AuthUser | null) => {
      this.isLoggedIn = !!user;
      this.currentUserId = user?.id ?? null;

      if (this.currentUserId) {
        this.loadTileViews(this.currentUserId);
      } else {
        this.tileViewMap.clear();
      }
    });

    this.loadSigns();
  }

  /**
   * Load signs from JSON file via SignService
   * Signs are defined in: assets/data/road-signs.json
   */
  loadSigns() {
    this.isLoading = true;
    this.signService.getAllSigns().subscribe({
      next: (signs: RoadSign[]) => {
        this.signs = signs;
        this.filterSigns();
        this.isLoading = false;
      },
      error: () => {
        this.signs = [];
        this.filterSigns();
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterSigns();
  }

  filterSigns() {
    if (this.selectedCategory === 'ALL') {
      this.filteredSigns = this.signs;
    } else {
      this.filteredSigns = this.signs.filter(s => s.category === this.selectedCategory);
    }
  }

  selectSign(sign: RoadSign) {
    this.selectedSign = sign;

    if (!this.currentUserId) {
      return;
    }

    this.signService.markTileViewed(sign.id, this.currentUserId).subscribe({
      next: (view: TileViewStatus) => {
        this.tileViewMap.set(view.signId, view.lastViewedAt);
      }
    });
  }

  closeDetail() {
    this.selectedSign = null;
  }

  tileStatus(signId: number): 'NONE' | 'VIEWED' | 'REVIEW' {
    const lastViewedAt = this.tileViewMap.get(signId);
    if (!lastViewedAt) {
      return 'NONE';
    }

    const viewedAt = new Date(lastViewedAt).getTime();
    const now = Date.now();
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;

    return now - viewedAt >= fiveDaysInMs ? 'REVIEW' : 'VIEWED';
  }

  private loadTileViews(userId: number) {
    this.signService.getTileViews(userId).subscribe({
      next: (views: TileViewStatus[]) => {
        this.tileViewMap.clear();
        views.forEach((view) => this.tileViewMap.set(view.signId, view.lastViewedAt));
      },
      error: () => {
        this.tileViewMap.clear();
      }
    });
  }
}
